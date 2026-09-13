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
