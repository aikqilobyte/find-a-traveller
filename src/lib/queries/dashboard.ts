import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats(userId: string) {
  const supabase = await createClient();

  const [
    activePosts,
    bookingRequests,
    acceptedBookings,
    completedAsTraveller,
    myShipRequests,
    myOrdersAsShopper,
    activeOrders,
    completedOrders,
  ] = await Promise.all([
    supabase.from("traveller_posts").select("id", { count: "exact", head: true }).eq("traveller_id", userId).eq("status", "active"),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("traveller_id", userId).in("status", ["requested", "offer_pending"]),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("traveller_id", userId).in("status", ["accepted", "payment_pending", "paid", "pickup_pending", "pickup_confirmed", "in_transit", "delivery_pending", "otp_pending"]),
    supabase.from("bookings").select("total_cents, platform_fee_cents").eq("traveller_id", userId).eq("status", "completed"),
    supabase.from("ship_requests").select("id", { count: "exact", head: true }).eq("shopper_id", userId).in("status", ["active", "offer_received"]),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("shopper_id", userId),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("shopper_id", userId).in("status", ["accepted", "payment_pending", "paid", "pickup_pending", "pickup_confirmed", "in_transit", "delivery_pending", "otp_pending"]),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("shopper_id", userId).eq("status", "completed"),
  ]);

  const earningsCents = (completedAsTraveller.data ?? []).reduce(
    (sum, b) => sum + (b.total_cents - b.platform_fee_cents),
    0,
  );

  return {
    traveller: {
      activePosts: activePosts.count ?? 0,
      bookingRequests: bookingRequests.count ?? 0,
      acceptedBookings: acceptedBookings.count ?? 0,
      earningsCents: earningsCents || 0,
    },
    shopper: {
      shipRequests: myShipRequests.count ?? 0,
      totalOrders: myOrdersAsShopper.count ?? 0,
      activeOrders: activeOrders.count ?? 0,
      completedOrders: completedOrders.count ?? 0,
    },
  };
}
