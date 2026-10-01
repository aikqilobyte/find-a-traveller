-- ============================================================
-- Optional item insurance, chosen at checkout
-- ============================================================
-- Before paying, the package owner either insures the item for a declared
-- value, or explicitly acknowledges that it travels under the platform's
-- baseline liability. A choice is required either way — silence is not an
-- answer, because "I assumed it was covered" is the argument you do not
-- want to be having after something is lost.
--
-- The premium is added to the booking total, so create_payment_intent
-- charges it without needing to know insurance exists.
--
-- NOTE ON THE RATE: 2% of declared value, minimum $1, declared value
-- capped at $5,000. These are placeholders chosen to be plausible, not
-- underwritten figures — set them to whatever the business actually
-- agrees to cover.
-- ============================================================

alter table bookings
  add column if not exists insurance_opted boolean not null default false,
  add column if not exists declared_value_cents integer not null default 0,
  add column if not exists insurance_premium_cents integer not null default 0,
  add column if not exists liability_acknowledged boolean not null default false;

comment on column bookings.insurance_opted is 'Package owner chose to insure at checkout.';
comment on column bookings.liability_acknowledged is 'Package owner explicitly declined insurance and accepted baseline liability.';

-- Single source of truth for the premium, same reasoning as calculate_fees.
create or replace function calculate_insurance_premium(p_declared_value_cents integer)
returns integer
language plpgsql
immutable
as $$
begin
  if p_declared_value_cents is null or p_declared_value_cents <= 0 then
    return 0;
  end if;
  return greatest(round(p_declared_value_cents * 0.02)::integer, 100);
end;
$$;

create or replace function set_booking_insurance(
  p_booking_id uuid,
  p_opted boolean,
  p_declared_value_cents integer default 0
)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking bookings%rowtype;
  v_premium integer := 0;
  v_declared integer := 0;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  select * into v_booking from bookings where id = p_booking_id for update;
  if not found then
    raise exception 'booking_not_found' using errcode = 'P0002';
  end if;

  -- The package owner pays, so the package owner decides.
  if auth.uid() <> v_booking.shopper_id then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  -- Only before the money moves. Afterwards the premium is part of a
  -- completed transaction and changing it would silently alter what was
  -- charged.
  if v_booking.status <> 'payment_pending' then
    raise exception 'insurance_locked' using errcode = 'P0001';
  end if;

  if p_opted then
    if p_declared_value_cents is null or p_declared_value_cents <= 0 then
      raise exception 'declared_value_required' using errcode = 'P0001';
    end if;
    if p_declared_value_cents > 500000 then
      raise exception 'declared_value_too_high' using errcode = 'P0001';
    end if;
    v_declared := p_declared_value_cents;
    v_premium := calculate_insurance_premium(v_declared);
  end if;

  update bookings
     set insurance_opted = p_opted,
         declared_value_cents = v_declared,
         insurance_premium_cents = v_premium,
         liability_acknowledged = not p_opted,
         -- Rebuild the total from its parts rather than adjusting it, so
         -- changing the choice twice cannot compound the premium.
         total_cents = item_price_cents + service_fee_cents + platform_fee_cents + v_premium,
         updated_at = now()
   where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;

revoke all on function set_booking_insurance(uuid, boolean, integer) from public;
grant execute on function set_booking_insurance(uuid, boolean, integer) to authenticated;
grant execute on function calculate_insurance_premium(integer) to authenticated, anon;
