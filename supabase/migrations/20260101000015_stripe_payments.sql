-- ============================================================
-- Settle a payment from a Stripe webhook
-- ============================================================
-- confirm_test_payment() authorises on auth.uid() = payer_id, which a
-- webhook cannot satisfy: Stripe calls us with no user session. This is
-- the same state transition with a different authority — the signed
-- webhook — so it is a separate function rather than a weakened one.
--
-- Because it does not check auth.uid(), execute is revoked from anon and
-- authenticated. If a signed-in user could call it they could mark their
-- own booking paid without paying. Only the service role, which is only
-- ever used server-side after verifying Stripe's signature, may run it.
--
-- Idempotent on purpose. Stripe retries a webhook until it gets a 2xx,
-- and the same event arriving twice must not advance a booking twice.
-- ============================================================

create or replace function confirm_stripe_payment(p_payment_id uuid, p_reference text)
returns payments
language plpgsql security definer set search_path = public as $$
declare
  v_payment payments%rowtype;
  v_booking bookings%rowtype;
begin
  select * into v_payment from payments where id = p_payment_id for update;
  if not found then
    raise exception 'payment_not_found' using errcode = 'P0001';
  end if;

  -- Already settled: a retry of an event we have handled.
  if v_payment.status = 'paid' then
    return v_payment;
  end if;

  if v_payment.status <> 'pending' then
    raise exception 'payment_not_pending' using errcode = 'P0001';
  end if;

  update payments
  set status = 'paid',
      paid_at = now(),
      payment_method = 'stripe',
      transaction_reference = p_reference
  where id = p_payment_id
  returning * into v_payment;

  update bookings set status = 'pickup_pending', updated_at = now()
  where id = v_payment.booking_id
  returning * into v_booking;

  perform notify_user(v_booking.traveller_id, 'payment_successful', 'Payment received',
    v_booking.item_description, '/dashboard/orders/' || v_booking.id);
  perform notify_user(v_booking.shopper_id, 'payment_successful', 'Payment successful',
    v_booking.item_description, '/dashboard/orders/' || v_booking.id);

  return v_payment;
end;
$$;

revoke execute on function confirm_stripe_payment(uuid, text) from public, anon, authenticated;
grant execute on function confirm_stripe_payment(uuid, text) to service_role;
