-- ============================================================
-- Find A Traveller — full database setup
-- Paste this ENTIRE file into your Supabase project's SQL Editor
-- and click "Run". It is safe to run only once on a fresh project.
-- (This file is just all of supabase/migrations/*.sql concatenated
-- in order, for convenience.)
-- ============================================================

-- Find A Traveller — initial schema
-- Enums, tables, indexes. RLS and functions follow in later migrations.

create extension if not exists "pgcrypto";

-- ============ ENUMS ============
create type verification_status as enum ('unverified','pending','verified','rejected');
create type trip_type as enum ('one_way','round_way');
create type transport_type as enum ('plane','train','bus','car');
create type traveller_post_status as enum ('draft','active','paused','fully_booked','expired','cancelled','completed');
create type ship_request_status as enum ('draft','active','offer_received','accepted','in_progress','completed','cancelled','expired');
create type travel_buddy_status as enum ('active','completed','cancelled');
create type offer_status as enum ('pending','accepted','rejected','countered','expired','cancelled');
create type booking_status as enum (
  'requested','offer_pending','accepted','payment_pending','paid',
  'pickup_pending','pickup_confirmed','in_transit','delivery_pending',
  'otp_pending','delivered','completed','rejected','cancelled','expired','disputed'
);
create type payment_status as enum ('pending','processing','paid','failed','refunded','partially_refunded');
create type item_condition as enum ('excellent','good','fair','damaged');
create type booking_service_type as enum ('luggage_sharing','ship_request');
create type offer_role as enum ('shopper','traveller');
create type report_target_type as enum ('user','post','booking','message');
create type report_status as enum ('open','reviewing','resolved','dismissed');

-- ============ PROFILES ============
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  display_name text,
  email text not null,
  phone text,
  avatar_url text,
  country text,
  city text,
  bio text,
  verification_status verification_status not null default 'unverified',
  average_rating numeric(3,2) not null default 0,
  total_reviews integer not null default 0,
  is_admin boolean not null default false,
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_country on profiles(country);

create table user_roles (
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('shopper','traveller')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- ============ CATEGORIES ============
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ============ TRAVELLER POSTS (Available Luggage Space) ============
create table traveller_posts (
  id uuid primary key default gen_random_uuid(),
  traveller_id uuid not null references profiles(id) on delete cascade,
  origin_country text not null,
  origin_city text not null,
  destination_country text not null,
  destination_city text not null,
  departure_date date not null,
  return_date date,
  trip_type trip_type not null default 'one_way',
  transport_type transport_type not null default 'plane',
  capacity_kg numeric(6,2) not null check (capacity_kg > 0),
  remaining_capacity_kg numeric(6,2) not null check (remaining_capacity_kg >= 0),
  price_per_kg_cents integer not null check (price_per_kg_cents >= 0),
  currency text not null default 'USD',
  notes text,
  rules text,
  insurance_info text,
  status traveller_post_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint remaining_lte_capacity check (remaining_capacity_kg <= capacity_kg)
);
create index idx_traveller_posts_route on traveller_posts(origin_country, destination_country);
create index idx_traveller_posts_departure on traveller_posts(departure_date);
create index idx_traveller_posts_status on traveller_posts(status);
create index idx_traveller_posts_traveller on traveller_posts(traveller_id);
create index idx_traveller_posts_created on traveller_posts(created_at desc);

create table traveller_post_categories (
  post_id uuid not null references traveller_posts(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (post_id, category_id)
);

-- ============ SHIP REQUESTS ============
create table ship_requests (
  id uuid primary key default gen_random_uuid(),
  shopper_id uuid not null references profiles(id) on delete cascade,
  origin_country text not null,
  origin_city text not null,
  destination_country text not null,
  destination_city text not null,
  item_description text not null,
  quantity integer not null default 1 check (quantity > 0),
  weight_kg numeric(6,2) not null check (weight_kg > 0),
  item_value_cents integer not null default 0,
  deadline date,
  proposed_payment_cents integer not null check (proposed_payment_cents >= 0),
  currency text not null default 'USD',
  transport_preference transport_type,
  notes text,
  image_url text,
  status ship_request_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_ship_requests_route on ship_requests(origin_country, destination_country);
create index idx_ship_requests_status on ship_requests(status);
create index idx_ship_requests_shopper on ship_requests(shopper_id);
create index idx_ship_requests_created on ship_requests(created_at desc);

create table ship_request_categories (
  request_id uuid not null references ship_requests(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (request_id, category_id)
);

-- ============ TRAVEL BUDDY ============
create table travel_buddy_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  origin_country text not null,
  origin_city text not null,
  destination_country text not null,
  destination_city text not null,
  travel_date date not null,
  return_date date,
  transport_type transport_type not null default 'plane',
  preferences text,
  description text,
  status travel_buddy_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_travel_buddy_route on travel_buddy_posts(origin_country, destination_country);
create index idx_travel_buddy_date on travel_buddy_posts(travel_date);
create index idx_travel_buddy_status on travel_buddy_posts(status);
create index idx_travel_buddy_user on travel_buddy_posts(user_id);

-- ============ BOOKINGS ============
create table bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number text not null unique,
  service_type booking_service_type not null,
  shopper_id uuid not null references profiles(id),
  traveller_id uuid not null references profiles(id),
  traveller_post_id uuid references traveller_posts(id),
  ship_request_id uuid references ship_requests(id),
  status booking_status not null default 'requested',
  weight_kg numeric(6,2) not null check (weight_kg > 0),
  item_description text not null,
  quantity integer not null default 1 check (quantity > 0),
  item_value_cents integer not null default 0,
  pickup_location text not null,
  delivery_location text not null,
  preferred_delivery_date date,
  special_instructions text,
  currency text not null default 'USD',
  item_price_cents integer not null default 0,
  service_fee_cents integer not null default 0,
  platform_fee_cents integer not null default 0,
  total_cents integer not null default 0,
  cancelled_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_source_check check (
    (service_type = 'luggage_sharing' and traveller_post_id is not null) or
    (service_type = 'ship_request' and ship_request_id is not null)
  )
);
create index idx_bookings_shopper on bookings(shopper_id);
create index idx_bookings_traveller on bookings(traveller_id);
create index idx_bookings_status on bookings(status);
create index idx_bookings_created on bookings(created_at desc);
create index idx_bookings_post on bookings(traveller_post_id);
create index idx_bookings_request on bookings(ship_request_id);

create table booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  category_id uuid references categories(id),
  description text not null,
  weight_kg numeric(6,2) not null check (weight_kg > 0),
  quantity integer not null default 1 check (quantity > 0),
  value_cents integer not null default 0,
  created_at timestamptz not null default now()
);
create index idx_booking_items_booking on booking_items(booking_id);

-- ============ OFFERS ============
create table offers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  made_by uuid not null references profiles(id),
  role offer_role not null,
  price_cents integer not null check (price_cents >= 0),
  weight_kg numeric(6,2) not null check (weight_kg > 0),
  delivery_conditions text,
  notes text,
  parent_offer_id uuid references offers(id),
  status offer_status not null default 'pending',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_offers_booking on offers(booking_id, created_at desc);
create index idx_offers_status on offers(status);

-- ============ PAYMENTS ============
create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  payer_id uuid not null references profiles(id),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'USD',
  service_fee_cents integer not null default 0,
  platform_fee_cents integer not null default 0,
  payment_method text not null default 'test_card',
  status payment_status not null default 'pending',
  transaction_reference text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index idx_payments_booking on payments(booking_id);
create index idx_payments_payer on payments(payer_id);
create index idx_payments_status on payments(status);

-- ============ MESSAGING ============
create table conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('booking','travel_buddy')),
  booking_id uuid references bookings(id) on delete cascade,
  travel_buddy_post_id uuid references travel_buddy_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint conversation_source_check check (
    (type = 'booking' and booking_id is not null) or
    (type = 'travel_buddy' and travel_buddy_post_id is not null)
  )
);
create unique index uq_conversations_booking on conversations(booking_id) where booking_id is not null;

create table conversation_participants (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);
create index idx_conv_participants_user on conversation_participants(user_id);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  body text,
  image_url text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint message_content_check check (body is not null or image_url is not null)
);
create index idx_messages_conversation on messages(conversation_id, created_at);

-- ============ PICKUP / DELIVERY ============
create table pickup_confirmations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id) on delete cascade,
  traveller_id uuid not null references profiles(id),
  condition item_condition not null,
  photo_urls text[] not null default '{}',
  notes text,
  confirmed_at timestamptz not null default now()
);

create table delivery_otps (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id) on delete cascade,
  code_hash text not null,
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table delivery_confirmations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id) on delete cascade,
  otp_id uuid references delivery_otps(id),
  confirmed_by uuid not null references profiles(id),
  delivered_at timestamptz not null default now()
);

-- ============ REVIEWS ============
create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  reviewer_id uuid not null references profiles(id),
  reviewee_id uuid not null references profiles(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (booking_id, reviewer_id),
  constraint no_self_review check (reviewer_id <> reviewee_id)
);
create index idx_reviews_reviewee on reviews(reviewee_id);

-- ============ NOTIFICATIONS ============
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id, created_at desc);
create index idx_notifications_unread on notifications(user_id) where is_read = false;

-- ============ REPORTS / ADMIN ============
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id),
  target_type report_target_type not null,
  target_id uuid not null,
  reason text not null,
  description text,
  status report_status not null default 'open',
  resolved_by uuid references profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_reports_status on reports(status);

create table admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles(id),
  action text not null,
  target_type text not null,
  target_id uuid,
  notes text,
  created_at timestamptz not null default now()
);
create index idx_admin_actions_admin on admin_actions(admin_id, created_at desc);

-- ============================================================
-- Find A Traveller — business-logic functions (SECURITY DEFINER)
-- ============================================================

create sequence if not exists booking_number_seq;

create or replace function next_booking_number() returns text
language sql as $$
  select 'FAT-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('booking_number_seq')::text, 5, '0');
$$;

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

-- ============================================================
-- Find A Traveller — Row Level Security
-- ============================================================

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

alter table profiles enable row level security;
alter table user_roles enable row level security;
alter table categories enable row level security;
alter table traveller_posts enable row level security;
alter table traveller_post_categories enable row level security;
alter table ship_requests enable row level security;
alter table ship_request_categories enable row level security;
alter table travel_buddy_posts enable row level security;
alter table bookings enable row level security;
alter table booking_items enable row level security;
alter table offers enable row level security;
alter table payments enable row level security;
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;
alter table pickup_confirmations enable row level security;
alter table delivery_otps enable row level security;
alter table delivery_confirmations enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;
alter table reports enable row level security;
alter table admin_actions enable row level security;

create policy "profiles are publicly readable" on profiles for select using (true);
create policy "users update own profile" on profiles for update using (auth.uid() = id);
create policy "admins update any profile" on profiles for update using (is_admin());

create policy "read own roles" on user_roles for select using (auth.uid() = user_id);
create policy "insert own roles" on user_roles for insert with check (auth.uid() = user_id);

create policy "categories are publicly readable" on categories for select using (true);
create policy "admins manage categories" on categories for all using (is_admin()) with check (is_admin());

create policy "active posts are public" on traveller_posts for select
  using (status = 'active' or traveller_id = auth.uid() or is_admin());
create policy "travellers insert own posts" on traveller_posts for insert
  with check (traveller_id = auth.uid());
create policy "travellers update own posts" on traveller_posts for update
  using (traveller_id = auth.uid() or is_admin());
create policy "travellers delete own draft posts" on traveller_posts for delete
  using (traveller_id = auth.uid() and status = 'draft');

create policy "post categories follow post visibility" on traveller_post_categories for select
  using (exists (select 1 from traveller_posts p where p.id = post_id and (p.status = 'active' or p.traveller_id = auth.uid() or is_admin())));
create policy "owners manage post categories" on traveller_post_categories for all
  using (exists (select 1 from traveller_posts p where p.id = post_id and p.traveller_id = auth.uid()))
  with check (exists (select 1 from traveller_posts p where p.id = post_id and p.traveller_id = auth.uid()));

create policy "active requests are public" on ship_requests for select
  using (status in ('active','offer_received') or shopper_id = auth.uid() or is_admin());
create policy "shoppers insert own requests" on ship_requests for insert
  with check (shopper_id = auth.uid());
create policy "shoppers update own requests" on ship_requests for update
  using (shopper_id = auth.uid() or is_admin());
create policy "shoppers delete own draft requests" on ship_requests for delete
  using (shopper_id = auth.uid() and status = 'draft');

create policy "request categories follow request visibility" on ship_request_categories for select
  using (exists (select 1 from ship_requests r where r.id = request_id and (r.status in ('active','offer_received') or r.shopper_id = auth.uid() or is_admin())));
create policy "owners manage request categories" on ship_request_categories for all
  using (exists (select 1 from ship_requests r where r.id = request_id and r.shopper_id = auth.uid()))
  with check (exists (select 1 from ship_requests r where r.id = request_id and r.shopper_id = auth.uid()));

create policy "active buddy posts are public" on travel_buddy_posts for select
  using (status = 'active' or user_id = auth.uid() or is_admin());
create policy "users insert own buddy posts" on travel_buddy_posts for insert
  with check (user_id = auth.uid());
create policy "users update own buddy posts" on travel_buddy_posts for update
  using (user_id = auth.uid() or is_admin());
create policy "users delete own buddy posts" on travel_buddy_posts for delete
  using (user_id = auth.uid());

create policy "participants read bookings" on bookings for select
  using (shopper_id = auth.uid() or traveller_id = auth.uid() or is_admin());

create policy "participants read booking items" on booking_items for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.shopper_id = auth.uid() or b.traveller_id = auth.uid() or is_admin())));

create policy "participants read offers" on offers for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.shopper_id = auth.uid() or b.traveller_id = auth.uid() or is_admin())));

create policy "participants read payments" on payments for select
  using (payer_id = auth.uid()
    or exists (select 1 from bookings b where b.id = booking_id and (b.traveller_id = auth.uid() or b.shopper_id = auth.uid()))
    or is_admin());

create policy "participants read conversations" on conversations for select
  using (exists (select 1 from conversation_participants cp where cp.conversation_id = id and cp.user_id = auth.uid()) or is_admin());
create policy "participants read participant rows" on conversation_participants for select
  using (user_id = auth.uid() or exists (select 1 from conversation_participants cp2 where cp2.conversation_id = conversation_id and cp2.user_id = auth.uid()));

create policy "participants read messages" on messages for select
  using (exists (select 1 from conversation_participants cp where cp.conversation_id = conversation_id and cp.user_id = auth.uid()) or is_admin());
create policy "participants send messages" on messages for insert
  with check (sender_id = auth.uid() and exists (select 1 from conversation_participants cp where cp.conversation_id = conversation_id and cp.user_id = auth.uid()));
create policy "recipients mark messages read" on messages for update
  using (exists (select 1 from conversation_participants cp where cp.conversation_id = conversation_id and cp.user_id = auth.uid() and cp.user_id <> sender_id))
  with check (true);

create policy "participants read pickup confirmations" on pickup_confirmations for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.shopper_id = auth.uid() or b.traveller_id = auth.uid())) or is_admin());
create policy "participants read delivery confirmations" on delivery_confirmations for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.shopper_id = auth.uid() or b.traveller_id = auth.uid())) or is_admin());
create policy "admins read otp metadata" on delivery_otps for select using (is_admin());

create policy "reviews are publicly readable" on reviews for select using (true);

create policy "users read own notifications" on notifications for select using (user_id = auth.uid());
create policy "users mark own notifications read" on notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users read own reports" on reports for select using (reporter_id = auth.uid() or is_admin());
create policy "users file reports" on reports for insert with check (reporter_id = auth.uid());
create policy "admins update reports" on reports for update using (is_admin());

create policy "admins read admin actions" on admin_actions for select using (is_admin());
create policy "admins insert admin actions" on admin_actions for insert with check (is_admin() and admin_id = auth.uid());

-- ============================================================
-- Seed categories
-- ============================================================
insert into categories (name, slug) values
  ('Documents', 'documents'),
  ('Books', 'books'),
  ('Clothing', 'clothing'),
  ('Electronics', 'electronics'),
  ('Luxury', 'luxury'),
  ('Gifts', 'gifts'),
  ('Other', 'other')
on conflict (name) do nothing;

-- ============================================================
-- Newsletter subscribers (landing page footer)
-- ============================================================
create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;
create policy "anyone can subscribe" on newsletter_subscribers for insert with check (true);
create policy "admins read subscribers" on newsletter_subscribers for select using (is_admin());

-- ============================================================
-- Notification preferences
-- ============================================================
alter table profiles add column email_notifications_enabled boolean not null default true;

-- ============================================================
-- Done! You should see "Success. No rows returned" below.
-- ============================================================
