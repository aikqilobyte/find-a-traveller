-- ============================================================
-- Transit checkpoints
-- ============================================================
-- Between handing a parcel over and receiving it, the package owner has
-- no idea where it is. The booking status moves in big jumps —
-- in_transit sits unchanged for a day and a half of flying — so this adds
-- finer-grained checkpoints inside that gap.
--
-- Stages are a fixed list rather than free text so the timeline can be
-- drawn as progress and the data can be reported on later; the optional
-- note carries the detail a fixed list cannot ("delayed 3h at Doha").
--
-- These are informational. They deliberately do NOT drive the booking
-- state machine: custody and delivery are decided by pickup confirmation
-- and the delivery code, not by someone tapping "Landed".
-- ============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'transit_stage') then
    create type transit_stage as enum ('boarding', 'in_transit', 'landed', 'out_for_delivery');
  end if;
end
$$;

create table if not exists transit_updates (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  created_by uuid not null references profiles(id),
  stage transit_stage not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_transit_updates_booking
  on transit_updates (booking_id, created_at desc);

alter table transit_updates enable row level security;

-- Readable by the two people on the booking, and by admins. Writes go
-- through add_transit_update() only — there is no insert policy.
drop policy if exists "participants read transit updates" on transit_updates;
create policy "participants read transit updates" on transit_updates for select
  using (
    exists (
      select 1 from bookings b
       where b.id = booking_id
         and (b.shopper_id = auth.uid() or b.traveller_id = auth.uid())
    )
    or is_admin()
  );

create or replace function add_transit_update(
  p_booking_id uuid,
  p_stage transit_stage,
  p_note text default null
)
returns transit_updates
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking bookings%rowtype;
  v_update transit_updates%rowtype;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  select * into v_booking from bookings where id = p_booking_id;
  if not found then
    raise exception 'booking_not_found' using errcode = 'P0002';
  end if;

  -- Only the person actually carrying it can say where it is.
  if auth.uid() <> v_booking.traveller_id then
    raise exception 'only_traveller_can_update' using errcode = '42501';
  end if;

  if v_booking.status not in (
    'pickup_confirmed', 'in_transit', 'delivery_pending', 'otp_pending'
  ) then
    raise exception 'not_in_transit' using errcode = 'P0001';
  end if;

  insert into transit_updates (booking_id, created_by, stage, note)
  values (p_booking_id, auth.uid(), p_stage, nullif(trim(coalesce(p_note, '')), ''))
  returning * into v_update;

  -- First checkpoint moves the booking into transit, so the owner's view
  -- stops saying "awaiting pickup" once the traveller is plainly moving.
  if v_booking.status = 'pickup_confirmed' then
    update bookings set status = 'in_transit', updated_at = now() where id = p_booking_id;
  end if;

  perform notify_user(
    v_booking.shopper_id,
    'transit_update',
    'Your package moved',
    case p_stage
      when 'boarding' then 'The traveller is boarding.'
      when 'in_transit' then 'Your package is in transit.'
      when 'landed' then 'The traveller has landed.'
      when 'out_for_delivery' then 'Your package is out for delivery.'
    end,
    '/dashboard/orders/' || p_booking_id
  );

  return v_update;
end;
$$;

revoke all on function add_transit_update(uuid, transit_stage, text) from public;
grant execute on function add_transit_update(uuid, transit_stage, text) to authenticated;
