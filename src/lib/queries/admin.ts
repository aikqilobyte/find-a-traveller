import { createClient } from "@/lib/supabase/server";

export async function getAdminMetrics() {
  const supabase = await createClient();

  const [totalUsers, activeTravellers, activePosts, bookings, completedOrders, revenue] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("traveller_posts").select("traveller_id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("traveller_posts").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("bookings").select("id", { count: "exact", head: true }),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("payments").select("platform_fee_cents").eq("status", "paid"),
  ]);

  const platformRevenueCents = (revenue.data ?? []).reduce((sum, p) => sum + p.platform_fee_cents, 0);

  return {
    totalUsers: totalUsers.count ?? 0,
    activeTravellers: activeTravellers.count ?? 0,
    activePosts: activePosts.count ?? 0,
    bookings: bookings.count ?? 0,
    completedOrders: completedOrders.count ?? 0,
    platformRevenueCents,
  };
}

export async function getAllUsers() {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);
  return data ?? [];
}

export async function getAllTravellerPosts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("traveller_posts")
    .select("*, traveller:profiles(*)")
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getAllShipRequests() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ship_requests")
    .select("*, shopper:profiles(*)")
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getAllBookingsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, shopper:profiles!bookings_shopper_id_fkey(*), traveller:profiles!bookings_traveller_id_fkey(*)")
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getAllPaymentsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("payments").select("*, booking:bookings(booking_number)").order("created_at", { ascending: false }).limit(100);
  return data ?? [];
}

export async function getAllReports() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select("*, reporter:profiles(*)")
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}
