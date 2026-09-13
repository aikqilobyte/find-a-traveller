-- Find A Traveller — business-logic functions (SECURITY DEFINER)
-- These are the ONLY way state-changing, money- or capacity-affecting
-- operations happen. All of them re-validate auth.uid(), ownership, and
-- state transitions server-side so a client can never bypass a rule by
-- calling them out of order or with a forged payload.

create sequence if not exists booking_number_seq;

create or replace function next_booking_number() returns text
language sql as $$
  select 'FAT-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('booking_number_seq')::text, 5, '0');
$$;

-- Centralized fee engine. Single source of truth for money math — never
-- duplicate these constants anywhere else (client or server).
create or replace function calculate_fees(item_price_cents integer)
returns table(service_fee_cents integer, platform_fee_cents integer, total_cents integer)
language plpgsql immutable as $$
declare
  v_service integer;
  v_platform integer;
begin
  v_service := round(item_price_cents * 0.08)::integer;
  v_platform := greatest(round(item_price_cents * 0.02)::integer, 100);
  return query select v_service, v_platform, item_price_cents + v_service + v_platform;
end;
$$;

create or replace function notify_user(p_user_id uuid, p_type text, p_title text, p_body text, p_link text default null)
returns void language sql security definer set search_path = public as $$
  insert into notifications (user_id, type, title, body, link) values (p_user_id, p_type, p_title, p_body, p_link);
$$;

-- ============ NEW USER -> PROFILE ============
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============ REVIEW -> RATING AGGREGATE ============
create or replace function update_profile_rating() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update profiles set
    total_reviews = (select count(*) from reviews where reviewee_id = new.reviewee_id),
    average_rating = (select coalesce(round(avg(rating)::numeric, 2), 0) from reviews where reviewee_id = new.reviewee_id),
    updated_at = now()
  where id = new.reviewee_id;
  return new;
end;
$$;

create trigger trg_review_rating
  after insert on reviews
  for each row execute function update_profile_rating();

-- ============ CAPACITY HOLD HELPERS (internal) ============
create or replace function _hold_capacity(p_post_id uuid, p_weight_kg numeric)
returns void language plpgsql as $$
declare
  v_post traveller_posts%rowtype;
begin
  select * into v_post from traveller_posts where id = p_post_id for update;
  if not found then
    raise exception 'post_not_found' using errcode = 'P0001';
  end if;
  if v_post.status not in ('active') then
    raise exception 'post_not_bookable' using errcode = 'P0001';
  end if;
  if v_post.departure_date < current_date then
    update traveller_posts set status = 'expired', updated_at = now() where id = p_post_id;
    raise exception 'post_expired' using errcode = 'P0001';
  end if;
  if v_post.remaining_capacity_kg < p_weight_kg then
    raise exception 'insufficient_capacity' using errcode = 'P0001';
  end if;
  update traveller_posts
    set remaining_capacity_kg = remaining_capacity_kg - p_weight_kg,
        status = case when remaining_capacity_kg - p_weight_kg <= 0 then 'fully_booked' else status end,
        updated_at = now()
    where id = p_post_id;
end;
$$;

create or replace function _release_capacity(p_post_id uuid, p_weight_kg numeric)
returns void language plpgsql as $$
begin
  if p_post_id is null then
    return;
  end if;
  update traveller_posts
    set remaining_capacity_kg = least(capacity_kg, remaining_capacity_kg + p_weight_kg),
        status = case when status = 'fully_booked' then 'active' else status end,
        updated_at = now()
    where id = p_post_id;
end;
$$;

-- ============ LUGGAGE SHARING: CREATE BOOKING (SHOPPER BOOKS AVAILABLE SPACE) ============
create or replace function create_luggage_booking(
  p_post_id uuid,
  p_weight_kg numeric,
  p_item_description text,
  p_category_id uuid,
  p_quantity integer,
  p_item_value_cents integer,
  p_pickup_location text,
  p_delivery_location text,
  p_preferred_delivery_date date,
  p_special_instructions text
) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_post traveller_posts%rowtype;
  v_booking bookings%rowtype;
  v_item_price_cents integer;
  v_fees record;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  perform _hold_capacity(p_post_id, p_weight_kg);
  select * into v_post from traveller_posts where id = p_post_id;

  if v_post.traveller_id = auth.uid() then
    raise exception 'cannot_book_own_post' using errcode = 'P0001';
  end if;

  v_item_price_cents := round(p_weight_kg * v_post.price_per_kg_cents)::integer;
  select * into v_fees from calculate_fees(v_item_price_cents);

  insert into bookings (
    booking_number, service_type, shopper_id, traveller_id, traveller_post_id,
    status, weight_kg, item_description, quantity, item_value_cents,
    pickup_location, delivery_location, preferred_delivery_date, special_instructions,
    currency, item_price_cents, service_fee_cents, platform_fee_cents, total_cents
  ) values (
    next_booking_number(), 'luggage_sharing', auth.uid(), v_post.traveller_id, p_post_id,
    'requested', p_weight_kg, p_item_description, coalesce(p_quantity, 1), coalesce(p_item_value_cents, 0),
    p_pickup_location, p_delivery_location, p_preferred_delivery_date, p_special_instructions,
    v_post.currency, v_item_price_cents, v_fees.service_fee_cents, v_fees.platform_fee_cents, v_fees.total_cents
  ) returning * into v_booking;

  insert into booking_items (booking_id, category_id, description, weight_kg, quantity, value_cents)
  values (v_booking.id, p_category_id, p_item_description, p_weight_kg, coalesce(p_quantity, 1), coalesce(p_item_value_cents, 0));

  -- Represent the shopper's request as the first offer in the chain so
  -- accept_offer / reject_offer / create_counter_offer work uniformly for
  -- both luggage-sharing and ship-request bookings.
  insert into offers (booking_id, made_by, role, price_cents, weight_kg, notes, status)
  values (v_booking.id, auth.uid(), 'shopper', v_item_price_cents, p_weight_kg, p_special_instructions, 'pending');

  insert into conversations (type, booking_id) values ('booking', v_booking.id);
  insert into conversation_participants (conversation_id, user_id)
    select id, auth.uid() from conversations where booking_id = v_booking.id
    union all
    select id, v_post.traveller_id from conversations where booking_id = v_booking.id;

  perform notify_user(v_post.traveller_id, 'booking_requested', 'New booking request',
    p_item_description || ' — ' || p_weight_kg || ' kg', '/dashboard/orders/' || v_booking.id);

  return v_booking;
end;
$$;

-- ============ SHIP REQUESTS: TRAVELLER MAKES AN OFFER ============
create or replace function create_offer_on_ship_request(
  p_request_id uuid,
  p_price_cents integer,
  p_weight_kg numeric,
  p_delivery_conditions text,
  p_notes text,
  p_pickup_location text,
  p_delivery_location text,
  p_expires_at timestamptz default null
) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_request ship_requests%rowtype;
  v_booking bookings%rowtype;
  v_fees record;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  select * into v_request from ship_requests where id = p_request_id for update;
  if not found or v_request.status not in ('active', 'offer_received') then
    raise exception 'request_not_open' using errcode = 'P0001';
  end if;
  if v_request.shopper_id = auth.uid() then
    raise exception 'cannot_offer_own_request' using errcode = 'P0001';
  end if;

  select * into v_fees from calculate_fees(p_price_cents);

  insert into bookings (
    booking_number, service_type, shopper_id, traveller_id, ship_request_id,
    status, weight_kg, item_description, quantity, item_value_cents,
    pickup_location, delivery_location, currency,
    item_price_cents, service_fee_cents, platform_fee_cents, total_cents
  ) values (
    next_booking_number(), 'ship_request', v_request.shopper_id, auth.uid(), p_request_id,
    'offer_pending', p_weight_kg, v_request.item_description, v_request.quantity, v_request.item_value_cents,
    p_pickup_location, p_delivery_location, v_request.currency,
    p_price_cents, v_fees.service_fee_cents, v_fees.platform_fee_cents, v_fees.total_cents
  ) returning * into v_booking;

  insert into offers (booking_id, made_by, role, price_cents, weight_kg, delivery_conditions, notes, expires_at)
  values (v_booking.id, auth.uid(), 'traveller', p_price_cents, p_weight_kg, p_delivery_conditions, p_notes, p_expires_at);

  update ship_requests set status = 'offer_received', updated_at = now() where id = p_request_id;

  insert into conversations (type, booking_id) values ('booking', v_booking.id);
  insert into conversation_participants (conversation_id, user_id)
    select id, v_request.shopper_id from conversations where booking_id = v_booking.id
    union all
    select id, auth.uid() from conversations where booking_id = v_booking.id;

  perform notify_user(v_request.shopper_id, 'offer_received', 'New offer on your ship request',
    v_request.item_description, '/dashboard/offers/' || v_booking.id);

  return v_booking;
end;
$$;

-- ============ COUNTER OFFER ============
create or replace function create_counter_offer(
  p_booking_id uuid,
  p_price_cents integer,
  p_weight_kg numeric,
  p_delivery_conditions text,
  p_notes text,
  p_expires_at timestamptz default null
) returns offers
language plpgsql security definer set search_path = public as $$
declare
  v_booking bookings%rowtype;
  v_last_offer offers%rowtype;
  v_role offer_role;
  v_new_offer offers%rowtype;
  v_weight_delta numeric;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  select * into v_booking from bookings where id = p_booking_id for update;
  if not found then
    raise exception 'booking_not_found' using errcode = 'P0001';
  end if;
  if auth.uid() not in (v_booking.shopper_id, v_booking.traveller_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_booking.status not in ('requested', 'offer_pending') then
    raise exception 'booking_not_negotiable' using errcode = 'P0001';
  end if;

  v_role := case when auth.uid() = v_booking.shopper_id then 'shopper' else 'traveller' end;

  select * into v_last_offer from offers where booking_id = p_booking_id order by created_at desc limit 1;
  if v_last_offer.id is not null then
    if v_last_offer.made_by = auth.uid() then
      raise exception 'not_your_turn' using errcode = 'P0001';
    end if;
    update offers set status = 'countered' where id = v_last_offer.id;
  end if;

  -- Reconcile capacity hold for luggage-sharing bookings when weight changes.
  if v_booking.service_type = 'luggage_sharing' then
    v_weight_delta := p_weight_kg - v_booking.weight_kg;
    if v_weight_delta > 0 then
      perform _hold_capacity(v_booking.traveller_post_id, v_weight_delta);
    elsif v_weight_delta < 0 then
      perform _release_capacity(v_booking.traveller_post_id, abs(v_weight_delta));
    end if;
  end if;

  insert into offers (booking_id, made_by, role, price_cents, weight_kg, delivery_conditions, notes, parent_offer_id, expires_at)
  values (p_booking_id, auth.uid(), v_role, p_price_cents, p_weight_kg, p_delivery_conditions, p_notes, v_last_offer.id, p_expires_at)
  returning * into v_new_offer;

  update bookings set
    status = 'offer_pending',
    weight_kg = p_weight_kg,
    item_price_cents = p_price_cents,
    service_fee_cents = (select service_fee_cents from calculate_fees(p_price_cents)),
    platform_fee_cents = (select platform_fee_cents from calculate_fees(p_price_cents)),
    total_cents = (select total_cents from calculate_fees(p_price_cents)),
    updated_at = now()
  where id = p_booking_id;

  perform notify_user(
    case when v_role = 'shopper' then v_booking.traveller_id else v_booking.shopper_id end,
    'counter_offer', 'Counter offer received', v_booking.item_description, '/dashboard/offers/' || p_booking_id);

  return v_new_offer;
end;
$$;

-- ============ ACCEPT / REJECT OFFER ============
create or replace function accept_offer(p_offer_id uuid) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_offer offers%rowtype;
  v_booking bookings%rowtype;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  select * into v_offer from offers where id = p_offer_id for update;
  if not found or v_offer.status <> 'pending' then
    raise exception 'offer_not_pending' using errcode = 'P0001';
  end if;

  select * into v_booking from bookings where id = v_offer.booking_id for update;
  if auth.uid() = v_offer.made_by then
    raise exception 'cannot_accept_own_offer' using errcode = 'P0001';
  end if;
  if auth.uid() not in (v_booking.shopper_id, v_booking.traveller_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update offers set status = 'accepted' where id = p_offer_id;
  update bookings set status = 'payment_pending', updated_at = now() where id = v_booking.id returning * into v_booking;

  if v_booking.service_type = 'ship_request' then
    update ship_requests set status = 'accepted', updated_at = now() where id = v_booking.ship_request_id;
  end if;

  perform notify_user(v_offer.made_by, 'offer_accepted', 'Your offer was accepted', v_booking.item_description, '/dashboard/orders/' || v_booking.id);

  return v_booking;
end;
$$;

create or replace function reject_offer(p_offer_id uuid, p_reason text default null) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_offer offers%rowtype;
  v_booking bookings%rowtype;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  select * into v_offer from offers where id = p_offer_id for update;
  if not found or v_offer.status <> 'pending' then
    raise exception 'offer_not_pending' using errcode = 'P0001';
  end if;

  select * into v_booking from bookings where id = v_offer.booking_id for update;
  if auth.uid() not in (v_booking.shopper_id, v_booking.traveller_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update offers set status = 'rejected' where id = p_offer_id;
  update bookings set status = 'rejected', cancelled_reason = p_reason, updated_at = now() where id = v_booking.id returning * into v_booking;

  if v_booking.service_type = 'luggage_sharing' then
    perform _release_capacity(v_booking.traveller_post_id, v_booking.weight_kg);
  else
    update ship_requests set status = 'active', updated_at = now() where id = v_booking.ship_request_id;
  end if;

  perform notify_user(v_offer.made_by, 'offer_rejected', 'Your offer was declined', v_booking.item_description, '/dashboard/offers/' || v_booking.id);

  return v_booking;
end;
$$;

-- ============ CANCEL BOOKING (pre-payment only) ============
create or replace function cancel_booking(p_booking_id uuid, p_reason text default null) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_booking bookings%rowtype;
  v_other uuid;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  select * into v_booking from bookings where id = p_booking_id for update;
  if not found then
    raise exception 'booking_not_found' using errcode = 'P0001';
  end if;
  if auth.uid() not in (v_booking.shopper_id, v_booking.traveller_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_booking.status not in ('requested', 'offer_pending', 'accepted', 'payment_pending') then
    raise exception 'cannot_cancel_in_current_state' using errcode = 'P0001';
  end if;

  update bookings set status = 'cancelled', cancelled_reason = p_reason, updated_at = now() where id = p_booking_id;

  if v_booking.service_type = 'luggage_sharing' then
    perform _release_capacity(v_booking.traveller_post_id, v_booking.weight_kg);
  else
    update ship_requests set status = 'active', updated_at = now() where id = v_booking.ship_request_id;
  end if;

  v_other := case when auth.uid() = v_booking.shopper_id then v_booking.traveller_id else v_booking.shopper_id end;
  perform notify_user(v_other, 'booking_cancelled', 'Booking cancelled', v_booking.item_description, '/dashboard/orders/' || p_booking_id);

  select * into v_booking from bookings where id = p_booking_id;
  return v_booking;
end;
$$;

-- ============ PAYMENTS (test-mode; see lib/payments for Stripe-ready path) ============
create or replace function create_payment_intent(p_booking_id uuid) returns payments
language plpgsql security definer set search_path = public as $$
declare
  v_booking bookings%rowtype;
  v_payment payments%rowtype;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  select * into v_booking from bookings where id = p_booking_id for update;
  if not found or auth.uid() <> v_booking.shopper_id then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_booking.status <> 'payment_pending' then
    raise exception 'booking_not_payable' using errcode = 'P0001';
  end if;

  select * into v_payment from payments where booking_id = p_booking_id and status = 'pending' limit 1;
  if not found then
    insert into payments (booking_id, payer_id, amount_cents, currency, service_fee_cents, platform_fee_cents, status)
    values (p_booking_id, auth.uid(), v_booking.total_cents, v_booking.currency, v_booking.service_fee_cents, v_booking.platform_fee_cents, 'pending')
    returning * into v_payment;
  end if;

  return v_payment;
end;
$$;

create or replace function confirm_test_payment(p_payment_id uuid) returns payments
language plpgsql security definer set search_path = public as $$
declare
  v_payment payments%rowtype;
  v_booking bookings%rowtype;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  select * into v_payment from payments where id = p_payment_id for update;
  if not found or auth.uid() <> v_payment.payer_id then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_payment.status <> 'pending' then
    raise exception 'payment_not_pending' using errcode = 'P0001';
  end if;

  update payments set status = 'paid', paid_at = now(), transaction_reference = 'TEST-' || upper(substr(md5(random()::text), 1, 10))
  where id = p_payment_id returning * into v_payment;

  update bookings set status = 'pickup_pending', updated_at = now() where id = v_payment.booking_id returning * into v_booking;

  perform notify_user(v_booking.traveller_id, 'payment_successful', 'Payment received', v_booking.item_description, '/dashboard/orders/' || v_booking.id);
  perform notify_user(v_booking.shopper_id, 'payment_successful', 'Payment successful', v_booking.item_description, '/dashboard/orders/' || v_booking.id);

  return v_payment;
end;
$$;

-- ============ PICKUP ============
create or replace function confirm_pickup(
  p_booking_id uuid,
  p_condition item_condition,
  p_photo_urls text[],
  p_notes text
) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_booking bookings%rowtype;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  select * into v_booking from bookings where id = p_booking_id for update;
  if not found or auth.uid() <> v_booking.traveller_id then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_booking.status <> 'pickup_pending' then
    raise exception 'invalid_state_for_pickup' using errcode = 'P0001';
  end if;

  insert into pickup_confirmations (booking_id, traveller_id, condition, photo_urls, notes)
  values (p_booking_id, auth.uid(), p_condition, coalesce(p_photo_urls, '{}'), p_notes);

  update bookings set status = 'pickup_confirmed', updated_at = now() where id = p_booking_id returning * into v_booking;

  perform notify_user(v_booking.shopper_id, 'pickup_confirmed', 'Item picked up', v_booking.item_description, '/dashboard/orders/' || p_booking_id);

  return v_booking;
end;
$$;

create or replace function start_transit(p_booking_id uuid) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_booking bookings%rowtype;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  select * into v_booking from bookings where id = p_booking_id for update;
  if not found or auth.uid() <> v_booking.traveller_id then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_booking.status <> 'pickup_confirmed' then
    raise exception 'invalid_state_for_transit' using errcode = 'P0001';
  end if;

  update bookings set status = 'in_transit', updated_at = now() where id = p_booking_id returning * into v_booking;
  perform notify_user(v_booking.shopper_id, 'in_transit', 'Your item is in transit', v_booking.item_description, '/dashboard/orders/' || p_booking_id);
  return v_booking;
end;
$$;

-- ============ DELIVERY + OTP ============
create or replace function initiate_delivery(p_booking_id uuid) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_booking bookings%rowtype;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  select * into v_booking from bookings where id = p_booking_id for update;
  if not found or auth.uid() <> v_booking.traveller_id then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_booking.status <> 'in_transit' then
    raise exception 'invalid_state_for_delivery' using errcode = 'P0001';
  end if;

  update bookings set status = 'delivery_pending', updated_at = now() where id = p_booking_id returning * into v_booking;
  return v_booking;
end;
$$;

-- Generates a 6-digit OTP, stores only its bcrypt hash, and returns the
-- plaintext once — the caller (server action) is responsible for
-- delivering it to the shopper. In dev/test mode (no SMS provider
-- configured) the Next.js layer displays it directly in the UI with a
-- clearly labeled "test mode" banner instead of silently faking delivery.
create or replace function send_delivery_otp(p_booking_id uuid) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_booking bookings%rowtype;
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  select * into v_booking from bookings where id = p_booking_id for update;
  if not found or auth.uid() <> v_booking.traveller_id then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_booking.status <> 'delivery_pending' then
    raise exception 'invalid_state_for_otp' using errcode = 'P0001';
  end if;

  v_code := lpad(floor(random() * 1000000)::text, 6, '0');

  insert into delivery_otps (booking_id, code_hash, expires_at)
  values (p_booking_id, crypt(v_code, gen_salt('bf')), now() + interval '30 minutes')
  on conflict (booking_id) do update
    set code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0, verified_at = null;

  update bookings set status = 'otp_pending', updated_at = now() where id = p_booking_id;

  -- No SMS provider is configured in this environment, so the test-mode
  -- code is included directly in the shopper's notification instead of
  -- silently pretending an SMS was sent. Remove p_code from this message
  -- once a real SMS/email provider is wired up.
  perform notify_user(v_booking.shopper_id, 'delivery_otp', 'Your delivery code',
    '[TEST MODE — no SMS configured] Your code is ' || v_code || '. Share it with your traveller only after you receive the item.',
    '/dashboard/orders/' || p_booking_id);

  return v_code;
end;
$$;

create or replace function verify_delivery_otp(p_booking_id uuid, p_code text) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_booking bookings%rowtype;
  v_otp delivery_otps%rowtype;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  select * into v_booking from bookings where id = p_booking_id for update;
  if not found or auth.uid() <> v_booking.traveller_id then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_booking.status <> 'otp_pending' then
    raise exception 'invalid_state_for_otp_verification' using errcode = 'P0001';
  end if;

  select * into v_otp from delivery_otps where booking_id = p_booking_id for update;
  if not found or v_otp.verified_at is not null then
    raise exception 'otp_not_found' using errcode = 'P0001';
  end if;
  if v_otp.expires_at < now() then
    raise exception 'otp_expired' using errcode = 'P0001';
  end if;
  if v_otp.attempts >= v_otp.max_attempts then
    raise exception 'otp_locked' using errcode = 'P0001';
  end if;

  if v_otp.code_hash <> crypt(p_code, v_otp.code_hash) then
    update delivery_otps set attempts = attempts + 1 where id = v_otp.id;
    raise exception 'otp_incorrect' using errcode = 'P0001';
  end if;

  update delivery_otps set verified_at = now() where id = v_otp.id;

  insert into delivery_confirmations (booking_id, otp_id, confirmed_by)
  values (p_booking_id, v_otp.id, auth.uid());

  update bookings set status = 'completed', updated_at = now() where id = p_booking_id returning * into v_booking;

  if v_booking.service_type = 'ship_request' then
    update ship_requests set status = 'completed', updated_at = now() where id = v_booking.ship_request_id;
  end if;

  perform notify_user(v_booking.shopper_id, 'order_completed', 'Delivery completed', 'Please leave a review for your traveller.', '/dashboard/orders/' || p_booking_id);
  perform notify_user(v_booking.traveller_id, 'order_completed', 'Delivery completed', 'Please leave a review for your shopper.', '/dashboard/orders/' || p_booking_id);

  return v_booking;
end;
$$;

-- ============ REVIEWS ============
create or replace function create_review(p_booking_id uuid, p_reviewee_id uuid, p_rating integer, p_comment text) returns reviews
language plpgsql security definer set search_path = public as $$
declare
  v_booking bookings%rowtype;
  v_review reviews%rowtype;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
  if p_rating < 1 or p_rating > 5 then
    raise exception 'invalid_rating' using errcode = 'P0001';
  end if;

  select * into v_booking from bookings where id = p_booking_id;
  if not found or v_booking.status <> 'completed' then
    raise exception 'booking_not_completed' using errcode = 'P0001';
  end if;
  if auth.uid() not in (v_booking.shopper_id, v_booking.traveller_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_reviewee_id not in (v_booking.shopper_id, v_booking.traveller_id) or p_reviewee_id = auth.uid() then
    raise exception 'invalid_reviewee' using errcode = 'P0001';
  end if;

  insert into reviews (booking_id, reviewer_id, reviewee_id, rating, comment)
  values (p_booking_id, auth.uid(), p_reviewee_id, p_rating, p_comment)
  returning * into v_review;

  perform notify_user(p_reviewee_id, 'review_received', 'You received a new review', p_comment, '/profile/' || p_reviewee_id);

  return v_review;
end;
$$;

-- ============ TRAVELLER POST LIFECYCLE ============
create or replace function set_post_status(p_post_id uuid, p_status traveller_post_status) returns traveller_posts
language plpgsql security definer set search_path = public as $$
declare
  v_post traveller_posts%rowtype;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
  select * into v_post from traveller_posts where id = p_post_id for update;
  if not found or v_post.traveller_id <> auth.uid() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_status not in ('active', 'paused', 'cancelled') then
    raise exception 'invalid_target_status' using errcode = 'P0001';
  end if;
  update traveller_posts set status = p_status, updated_at = now() where id = p_post_id returning * into v_post;
  return v_post;
end;
$$;

revoke execute on all functions in schema public from public;
grant execute on function calculate_fees(integer) to authenticated, anon;
grant execute on function create_luggage_booking(uuid, numeric, text, uuid, integer, integer, text, text, date, text) to authenticated;
grant execute on function create_offer_on_ship_request(uuid, integer, numeric, text, text, text, text, timestamptz) to authenticated;
grant execute on function create_counter_offer(uuid, integer, numeric, text, text, timestamptz) to authenticated;
grant execute on function accept_offer(uuid) to authenticated;
grant execute on function reject_offer(uuid, text) to authenticated;
grant execute on function cancel_booking(uuid, text) to authenticated;
grant execute on function create_payment_intent(uuid) to authenticated;
grant execute on function confirm_test_payment(uuid) to authenticated;
grant execute on function confirm_pickup(uuid, item_condition, text[], text) to authenticated;
grant execute on function start_transit(uuid) to authenticated;
grant execute on function initiate_delivery(uuid) to authenticated;
grant execute on function send_delivery_otp(uuid) to authenticated;
grant execute on function verify_delivery_otp(uuid, text) to authenticated;
grant execute on function create_review(uuid, uuid, integer, text) to authenticated;
grant execute on function set_post_status(uuid, traveller_post_status) to authenticated;
