-- ============================================================
-- Pre-booking enquiry chat
-- ============================================================
-- Until now a conversation could only hang off a booking, so two people
-- had to commit to a booking before they could ask each other anything —
-- "will you take a 3 kg parcel?" required creating a booking first.
--
-- This adds a third conversation type tied to the post being enquired
-- about. Identity stays hidden: an enquiry has no booking, so
-- isIdentityRevealed() is false for it and both sides show as Anonymous
-- until a real booking is made and paid for.
-- ============================================================

alter table conversations drop constraint if exists conversations_type_check;
alter table conversations
  add constraint conversations_type_check
  check (type in ('booking', 'travel_buddy', 'inquiry'));

alter table conversations
  add column if not exists traveller_post_id uuid references traveller_posts(id) on delete cascade,
  add column if not exists ship_request_id uuid references ship_requests(id) on delete cascade,
  -- Who opened the enquiry. Kept on the row (rather than derived from
  -- conversation_participants) so one person gets one thread per post,
  -- enforceable by a unique index.
  add column if not exists initiator_id uuid references profiles(id) on delete cascade;

alter table conversations drop constraint if exists conversation_source_check;
alter table conversations
  add constraint conversation_source_check check (
    (type = 'booking' and booking_id is not null)
    or (type = 'travel_buddy' and travel_buddy_post_id is not null)
    or (type = 'inquiry' and initiator_id is not null
        and (traveller_post_id is not null or ship_request_id is not null))
  );

create unique index if not exists uq_conversations_inquiry_traveller_post
  on conversations (traveller_post_id, initiator_id)
  where type = 'inquiry' and traveller_post_id is not null;

create unique index if not exists uq_conversations_inquiry_ship_request
  on conversations (ship_request_id, initiator_id)
  where type = 'inquiry' and ship_request_id is not null;

-- ============ START (OR REOPEN) AN ENQUIRY ============
-- Idempotent: clicking "Start Chat" twice returns the same thread rather
-- than piling up empty conversations.
create or replace function start_inquiry(
  p_traveller_post_id uuid default null,
  p_ship_request_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_owner uuid;
  v_conversation_id uuid;
begin
  if v_user is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  -- Exactly one of the two posts, never both and never neither.
  if (p_traveller_post_id is null) = (p_ship_request_id is null) then
    raise exception 'exactly_one_post_required' using errcode = 'P0001';
  end if;

  if p_traveller_post_id is not null then
    select traveller_id into v_owner
      from traveller_posts
     where id = p_traveller_post_id and status = 'active';
  else
    select shopper_id into v_owner
      from ship_requests
     where id = p_ship_request_id and status in ('active', 'offer_received');
  end if;

  if v_owner is null then
    raise exception 'post_not_available' using errcode = 'P0002';
  end if;

  if v_owner = v_user then
    raise exception 'cannot_message_yourself' using errcode = 'P0001';
  end if;

  if p_traveller_post_id is not null then
    select id into v_conversation_id from conversations
     where type = 'inquiry' and initiator_id = v_user and traveller_post_id = p_traveller_post_id;
  else
    select id into v_conversation_id from conversations
     where type = 'inquiry' and initiator_id = v_user and ship_request_id = p_ship_request_id;
  end if;

  if v_conversation_id is not null then
    return v_conversation_id;
  end if;

  insert into conversations (type, traveller_post_id, ship_request_id, initiator_id)
  values ('inquiry', p_traveller_post_id, p_ship_request_id, v_user)
  returning id into v_conversation_id;

  insert into conversation_participants (conversation_id, user_id)
  values (v_conversation_id, v_user), (v_conversation_id, v_owner);

  perform notify_user(
    v_owner,
    'inquiry_started',
    'New enquiry about your post',
    'Someone has a question before booking.',
    '/dashboard/messages/' || v_conversation_id
  );

  return v_conversation_id;
end;
$$;

revoke all on function start_inquiry(uuid, uuid) from public;
grant execute on function start_inquiry(uuid, uuid) to authenticated;
