-- ============================================================
-- Pre-payment contact-info filter
-- ============================================================
-- Enquiry chat lets two strangers talk before any money is committed.
-- The cheapest move for both of them is to swap phone numbers and settle
-- off-platform: the platform earns nothing, and the delivery happens with
-- no escrow, no delivery code and no recourse if it goes wrong.
--
-- This runs as a BEFORE INSERT trigger rather than in the application, so
-- it cannot be stepped around by calling the REST API directly. RLS lets
-- a participant insert into messages; the trigger sees every one of those
-- inserts regardless of who issued it.
--
-- Contact details are redacted, not blocked. Blocking loses the rest of a
-- legitimate message, and these patterns will sometimes fire on innocent
-- text — losing "my flight lands at 3, here is my number ..." entirely
-- would be worse than delivering it with the number starred out.
--
-- Only applies before payment. Once money is in escrow the two sides are
-- meant to exchange details (step 6), so the filter stands down.
-- ============================================================

alter table messages
  add column if not exists redacted boolean not null default false,
  add column if not exists redacted_patterns text[] not null default '{}';

comment on column messages.redacted is
  'True when the contact-info filter altered this message before it was stored.';
comment on column messages.redacted_patterns is
  'Which detectors fired, for admin review and for tuning false positives.';

create or replace function filter_message_contact_info()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_body text := new.body;
  v_found text[] := '{}';
  v_booking_status booking_status;
  v_paid boolean := false;
  -- label, pattern. Order matters: the more specific patterns run first so
  -- that, for example, an email is not first mangled by the digit rule.
  v_rules text[][] := array[
    ['email',        '[A-Za-z0-9._%+-]+\s*@\s*[A-Za-z0-9.-]+\s*\.\s*[A-Za-z]{2,}'],
    ['email',        '[A-Za-z0-9._%+-]+\s*[\(\[\{]?\s*(at|AT|At)\s*[\)\]\}]?\s*[A-Za-z0-9.-]+\s*[\(\[\{]?\s*(dot|DOT|Dot)\s*[\)\]\}]?\s*[A-Za-z]{2,}'],
    ['link',         '(https?://|www\.)[^\s]+'],
    ['link',         '[A-Za-z0-9-]+\.(com|net|org|io|me|co|bd|info|xyz|link|page|site)\y[^\s]*'],
    ['handle',       '@[A-Za-z0-9_.]{3,}'],
    -- 9+ digits, however they are spaced, bracketed or punctuated.
    ['phone',        '\+?\d[\d\s().\-]{9,}\d'],
    -- Bangla numerals, same idea.
    ['phone',        '[০-৯][০-৯\s().\-]{9,}[০-৯]'],
    -- Digits spelled out to dodge the rules above, in English or Bangla.
    ['spelled_number', '(?i)((zero|one|two|three|four|five|six|seven|eight|nine|oh|nought|shunno|ek|dui|tin|char|pach|choy|shat|aat|noy)[\s,.\-]+){5,}(zero|one|two|three|four|five|six|seven|eight|nine|oh|nought|shunno|ek|dui|tin|char|pach|choy|shat|aat|noy)'],
    ['messaging_app', '(?i)\y(whats\s*app|whatsapp|telegram|viber|imo|signal|wechat|messenger|snapchat|skype)\y']
  ];
  v_label text;
  v_pattern text;
  v_before text;
  i int;
begin
  if v_body is null or length(trim(v_body)) = 0 then
    return new;
  end if;

  -- Once the related booking is paid, identities are deliberately shared,
  -- so filtering it would block the handover being arranged.
  if new.conversation_id is not null then
    select b.status into v_booking_status
      from conversations c
      join bookings b on b.id = c.booking_id
     where c.id = new.conversation_id;

    if v_booking_status is not null then
      v_paid := v_booking_status in (
        'paid','pickup_pending','pickup_confirmed','in_transit',
        'delivery_pending','otp_pending','delivered','completed','disputed'
      );
    end if;
  end if;

  if v_paid then
    return new;
  end if;

  for i in 1 .. array_length(v_rules, 1) loop
    v_label := v_rules[i][1];
    v_pattern := v_rules[i][2];
    v_before := v_body;
    v_body := regexp_replace(v_body, v_pattern, '[hidden]', 'g');
    if v_body is distinct from v_before and not (v_label = any(v_found)) then
      v_found := array_append(v_found, v_label);
    end if;
  end loop;

  if array_length(v_found, 1) > 0 then
    new.body := v_body;
    new.redacted := true;
    new.redacted_patterns := v_found;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_filter_message_contact_info on messages;
create trigger trg_filter_message_contact_info
  before insert on messages
  for each row execute function filter_message_contact_info();
