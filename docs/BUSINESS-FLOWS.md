# Business flows

## Luggage Sharing — end to end

1. Traveller signs up, is redirected through `/auth/callback` after confirming their email.
2. Traveller publishes an Available Space listing at `/dashboard/posts/new/luggage` (`createTravellerPost` → `traveller_posts` insert, RLS-scoped to `traveller_id = auth.uid()`).
3. Shopper searches `/available-space` (server-rendered, filtered by `lib/queries/traveller-posts.ts`, paginated).
4. Shopper opens `/traveller/[id]`, then `/traveller/[id]/book`.
5. Submitting the booking form calls `create_luggage_booking` — this is the atomic, capacity-locked step described in [DATABASE.md](DATABASE.md#concurrency--capacity-locking).
6. Both parties land on `/dashboard/orders/[id]`, which renders `OrderTimeline`, the chat (`ChatWindow`, realtime), and role/status-gated `Available Actions`.
7. Traveller accepts, rejects, or counters via `OfferNegotiation` (`accept_offer` / `reject_offer` / `create_counter_offer`).
8. On acceptance the booking becomes `payment_pending`; the shopper sees `PayNowButton` (test mode, clearly labeled) → `create_payment_intent` then `confirm_test_payment` → booking becomes `pickup_pending`.
9. Traveller confirms pickup (`PickupDialog` → `confirm_pickup`, requires two checkboxes + a condition selection) → `pickup_confirmed`.
10. Traveller starts transit (`start_transit`) → `in_transit`, then initiates delivery (`initiate_delivery`) → `delivery_pending`.
11. Traveller sends the delivery OTP (`send_delivery_otp`) → `otp_pending`. In this environment (no SMS provider configured) the plaintext code is included directly in the shopper's notification, clearly labeled "TEST MODE".
12. Shopper reads the traveller the code in person; traveller submits it (`verify_delivery_otp`) → `completed`.
13. Both parties can now leave a review (`ReviewDialog` → `create_review`, blocked for non-participants, self-reviews, and duplicates by both application logic and a DB unique constraint + check constraint).

## Ship Request — end to end

1. Shopper posts a request at `/dashboard/posts/new/ship-request`.
2. Traveller browses `/ship-requests`, opens a request, and submits an offer at `/ship-requests/[id]/offer` (`create_offer_on_ship_request`) — this creates the booking *and* the first `offers` row in one step, with the traveller as the offer's author.
3. From here the flow is identical to Luggage Sharing from step 7 onward: negotiate → pay → pickup → transit → delivery/OTP → complete → review.

## Travel Buddy — end to end

1. User posts a trip at `/dashboard/posts/new/travel-buddy`.
2. Another user browses `/travel-buddy`, opens a post, and clicks **Message**.
3. `startTravelBuddyConversation` finds or creates a `conversations` row (`type = 'travel_buddy'`) with both users as participants and redirects to `/dashboard/messages/[id]`.
4. Chat from there on is the same `ChatWindow` component used for booking chat, scoped by RLS to the two participants.

Travel Buddy deliberately has no payment, booking, or state machine — it's a connection feature only, per the MVP scope.

## Booking state machine

```
REQUESTED ──┐
            ├─(offer/counter-offer loop: create_counter_offer)──> OFFER_PENDING
            │
            └─(accept_offer)──> ACCEPTED / PAYMENT_PENDING
                                        │
                              (confirm_test_payment)
                                        ▼
                                  PICKUP_PENDING
                                        │
                               (confirm_pickup)
                                        ▼
                                 PICKUP_CONFIRMED
                                        │
                                (start_transit)
                                        ▼
                                   IN_TRANSIT
                                        │
                              (initiate_delivery)
                                        ▼
                                 DELIVERY_PENDING
                                        │
                             (send_delivery_otp)
                                        ▼
                                   OTP_PENDING
                                        │
                            (verify_delivery_otp, correct code)
                                        ▼
                                    COMPLETED

Alternative terminal states at any pre-payment step: REJECTED, CANCELLED, EXPIRED.
```

Every arrow above is a single Postgres function call; there is no code path that sets `bookings.status` directly from the client or from a Server Action. See [DATABASE.md](DATABASE.md#rpc-functions-the-state-machine) for the exact function list.
