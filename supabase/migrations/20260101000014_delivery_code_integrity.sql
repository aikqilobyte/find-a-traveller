-- ============================================================
-- Stop the delivery code being shown to the person it guards against
-- ============================================================
-- send_delivery_otp() returned the plaintext code to its caller, and the
-- caller is always the traveller. The order page then printed it on the
-- traveller's own screen under a "test mode" notice.
--
-- That defeats the whole mechanism. The code exists so that only the
-- person actually holding the package can release the booking: the owner
-- reads it, says it out loud at handover, and the traveller types it in.
-- A traveller who can see it can click send, read, type, and mark the
-- parcel delivered without ever having delivered anything — collecting
-- the payout on a package still in their bag.
--
-- The owner already receives the code through notify_user(), so that is
-- the delivery channel and nothing else needs to change for the flow to
-- work. The code simply stops coming back to the traveller.
--
-- Also replaces random() with pgcrypto's gen_random_bytes(). random() is
-- a seeded PRNG, not a cryptographic one: its output is reproducible from
-- its internal state, so codes drawn from it are guessable in a way that
-- codes guarding money should not be.
-- ============================================================

-- The return type changes from text to void, which create or replace
-- cannot do.
drop function if exists send_delivery_otp(uuid);

create function send_delivery_otp(p_booking_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_booking bookings%rowtype;
  v_bytes bytea;
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

  -- Four cryptographically random bytes assembled by hand rather than via
  -- a bit() cast, which is signed and would need an overflow guard. The
  -- modulo bias across 2^32 into 10^6 is about one part in a hundred
  -- thousand, which is far below anything that matters here.
  v_bytes := gen_random_bytes(4);
  v_code := lpad(
    ((get_byte(v_bytes, 0)::bigint * 16777216
      + get_byte(v_bytes, 1)::bigint * 65536
      + get_byte(v_bytes, 2)::bigint * 256
      + get_byte(v_bytes, 3)::bigint) % 1000000)::text,
    6, '0');

  insert into delivery_otps (booking_id, code_hash, expires_at)
  values (p_booking_id, crypt(v_code, gen_salt('bf')), now() + interval '30 minutes')
  on conflict (booking_id) do update
    set code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0, verified_at = null;

  update bookings set status = 'otp_pending', updated_at = now() where id = p_booking_id;

  -- The owner's notification is the only place the plaintext code exists
  -- after this function returns. It is never persisted and never sent
  -- back to the traveller.
  perform notify_user(v_booking.shopper_id, 'delivery_otp', 'Your delivery code',
    'Your delivery code is ' || v_code || '. Give it to your traveller only once the item is in your hands — it releases their payment.',
    '/dashboard/orders/' || p_booking_id);
end;
$$;
