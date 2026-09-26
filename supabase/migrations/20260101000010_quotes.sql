-- ============================================================
-- Quotes: turning an enquiry into a numbered work order
-- ============================================================
-- Two people agree terms in the enquiry chat. The traveller then sends a
-- formal quote, which is where the deal stops being a conversation and
-- becomes a work order with a number, a price, fees and a state machine.
--
-- A quote is a booking, not a new entity. It gets a booking_number — the
-- traceable work order number — and lands in 'offer_pending' with a
-- matching row in offers, so the existing accept_offer / reject_offer /
-- create_counter_offer path picks it up unchanged. Accepting moves it to
-- 'payment_pending', which is what checkout already expects.
--
-- The enquiry conversation is then attached to that booking, so the same
-- thread carries the deal: the next-step banner appears, and the contact
-- filter stands down once the booking is paid.
--
-- Deliberately no system message announcing the quote: the work order
-- number looks like a phone number to our own contact filter and would be
-- redacted. The card is rendered from booking state instead.
-- ============================================================

create or replace function create_quote(
  p_conversation_id uuid,
  p_price_cents integer,
  p_weight_kg numeric,
  p_item_description text,
  p_pickup_location text,
  p_delivery_location text,
  p_deadline date default null
)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conv conversations%rowtype;
  v_traveller uuid;
  v_shopper uuid;
  v_post_id uuid;
  v_request_id uuid;
  v_service booking_service_type;
  v_currency text := 'USD';
  v_fees record;
  v_booking bookings%rowtype;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
  if p_price_cents is null or p_price_cents <= 0 then
    raise exception 'invalid_quote_amount' using errcode = 'P0001';
  end if;
  if p_weight_kg is null or p_weight_kg <= 0 then
    raise exception 'invalid_quote_weight' using errcode = 'P0001';
  end if;
  if p_item_description is null or length(trim(p_item_description)) = 0 then
    raise exception 'invalid_quote_description' using errcode = 'P0001';
  end if;

  select * into v_conv from conversations where id = p_conversation_id;
  if v_conv.id is null then
    raise exception 'conversation_not_found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from conversation_participants
     where conversation_id = p_conversation_id and user_id = auth.uid()
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if v_conv.booking_id is not null then
    raise exception 'quote_already_sent' using errcode = 'P0001';
  end if;

  -- Whichever side posted, the traveller carries and the package owner pays.
  if v_conv.traveller_post_id is not null then
    select traveller_id, currency into v_traveller, v_currency
      from traveller_posts where id = v_conv.traveller_post_id;
    v_shopper := v_conv.initiator_id;
    v_post_id := v_conv.traveller_post_id;
    v_service := 'luggage_sharing';
  elsif v_conv.ship_request_id is not null then
    select shopper_id, currency into v_shopper, v_currency
      from ship_requests where id = v_conv.ship_request_id;
    v_traveller := v_conv.initiator_id;
    v_request_id := v_conv.ship_request_id;
    v_service := 'ship_request';
  else
    raise exception 'conversation_not_quotable' using errcode = 'P0001';
  end if;

  if v_traveller is distinct from auth.uid() then
    raise exception 'only_traveller_can_quote' using errcode = '42501';
  end if;

  -- Same capacity lock the ordinary booking path takes, so a traveller
  -- cannot quote away more space than the trip has left.
  if v_post_id is not null then
    perform _hold_capacity(v_post_id, p_weight_kg);
  end if;

  select * into v_fees from calculate_fees(p_price_cents);

  insert into bookings (
    booking_number, service_type, shopper_id, traveller_id,
    traveller_post_id, ship_request_id, status, weight_kg, item_description,
    quantity, item_value_cents, pickup_location, delivery_location,
    preferred_delivery_date, currency, item_price_cents,
    service_fee_cents, platform_fee_cents, total_cents
  ) values (
    next_booking_number(), v_service, v_shopper, v_traveller,
    v_post_id, v_request_id, 'offer_pending', p_weight_kg, p_item_description,
    1, 0, p_pickup_location, p_delivery_location,
    p_deadline, coalesce(v_currency, 'USD'), p_price_cents,
    v_fees.service_fee_cents, v_fees.platform_fee_cents, v_fees.total_cents
  ) returning * into v_booking;

  -- The quote itself, as the pending offer the package owner responds to.
  insert into offers (booking_id, made_by, role, price_cents, weight_kg, notes, status)
  values (v_booking.id, auth.uid(), 'traveller', p_price_cents, p_weight_kg, p_item_description, 'pending');

  update conversations set booking_id = v_booking.id where id = p_conversation_id;

  perform notify_user(
    v_shopper,
    'quote_received',
    'You have a quote',
    'Work order ' || v_booking.booking_number || ' is ready for you to review.',
    '/dashboard/messages/' || p_conversation_id
  );

  return v_booking;
end;
$$;

revoke all on function create_quote(uuid, integer, numeric, text, text, text, date) from public;
grant execute on function create_quote(uuid, integer, numeric, text, text, text, date) to authenticated;
