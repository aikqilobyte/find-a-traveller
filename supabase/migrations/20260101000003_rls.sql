-- Find A Traveller — Row Level Security
-- Principle: public can read active marketplace content; a user can only
-- read/write their own records or records they participate in; every
-- money/state-machine write goes through the SECURITY DEFINER functions
-- in 0002_functions.sql instead of a direct table policy.

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

-- ---------- profiles ----------
create policy "profiles are publicly readable" on profiles for select using (true);
create policy "users update own profile" on profiles for update using (auth.uid() = id);
create policy "admins update any profile" on profiles for update using (is_admin());

-- ---------- user_roles ----------
create policy "read own roles" on user_roles for select using (auth.uid() = user_id);
create policy "insert own roles" on user_roles for insert with check (auth.uid() = user_id);

-- ---------- categories ----------
create policy "categories are publicly readable" on categories for select using (true);
create policy "admins manage categories" on categories for all using (is_admin()) with check (is_admin());

-- ---------- traveller_posts ----------
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

-- ---------- ship_requests ----------
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

-- ---------- travel_buddy_posts ----------
create policy "active buddy posts are public" on travel_buddy_posts for select
  using (status = 'active' or user_id = auth.uid() or is_admin());
create policy "users insert own buddy posts" on travel_buddy_posts for insert
  with check (user_id = auth.uid());
create policy "users update own buddy posts" on travel_buddy_posts for update
  using (user_id = auth.uid() or is_admin());
create policy "users delete own buddy posts" on travel_buddy_posts for delete
  using (user_id = auth.uid());

-- ---------- bookings ----------
create policy "participants read bookings" on bookings for select
  using (shopper_id = auth.uid() or traveller_id = auth.uid() or is_admin());
-- All inserts/updates go through SECURITY DEFINER functions; no direct
-- client insert/update policy is granted so the state machine and
-- capacity checks cannot be bypassed.

-- ---------- booking_items ----------
create policy "participants read booking items" on booking_items for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.shopper_id = auth.uid() or b.traveller_id = auth.uid() or is_admin())));

-- ---------- offers ----------
create policy "participants read offers" on offers for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.shopper_id = auth.uid() or b.traveller_id = auth.uid() or is_admin())));

-- ---------- payments ----------
create policy "participants read payments" on payments for select
  using (payer_id = auth.uid()
    or exists (select 1 from bookings b where b.id = booking_id and (b.traveller_id = auth.uid() or b.shopper_id = auth.uid()))
    or is_admin());

-- ---------- conversations / participants / messages ----------
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

-- ---------- pickup / OTP / delivery (read-only to clients; writes via functions) ----------
create policy "participants read pickup confirmations" on pickup_confirmations for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.shopper_id = auth.uid() or b.traveller_id = auth.uid())) or is_admin());
create policy "participants read delivery confirmations" on delivery_confirmations for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.shopper_id = auth.uid() or b.traveller_id = auth.uid())) or is_admin());
-- delivery_otps holds only bcrypt hashes, but still restrict reads to admins;
-- the plaintext code is returned once from send_delivery_otp() and never stored.
create policy "admins read otp metadata" on delivery_otps for select using (is_admin());

-- ---------- reviews ----------
create policy "reviews are publicly readable" on reviews for select using (true);
-- inserts go through create_review() only.

-- ---------- notifications ----------
create policy "users read own notifications" on notifications for select using (user_id = auth.uid());
create policy "users mark own notifications read" on notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- reports ----------
create policy "users read own reports" on reports for select using (reporter_id = auth.uid() or is_admin());
create policy "users file reports" on reports for insert with check (reporter_id = auth.uid());
create policy "admins update reports" on reports for update using (is_admin());

-- ---------- admin_actions ----------
create policy "admins read admin actions" on admin_actions for select using (is_admin());
create policy "admins insert admin actions" on admin_actions for insert with check (is_admin() and admin_id = auth.uid());
