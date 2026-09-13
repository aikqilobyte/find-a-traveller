// Seeds realistic demo data into a Supabase project for local development.
//
// Usage:
//   node scripts/seed.mjs
//
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in
// .env.local (the service role key is required because this script
// creates auth users directly and bypasses RLS for bulk inserts).

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  try {
    const content = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local not found — rely on already-exported environment variables.
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in .env.local first.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_PASSWORD = "Demo1234!";

const DEMO_USERS = [
  {
    email: "ahmed.traveller@findatraveller.demo",
    fullName: "Ahmed Rahman",
    country: "Bangladesh",
    city: "Dhaka",
    bio: "Frequent business traveller between Dhaka and the Gulf. I carefully handle every item like it's my own.",
    verification: "verified",
    roles: ["traveller"],
  },
  {
    email: "fatima.shopper@findatraveller.demo",
    fullName: "Fatima Khan",
    country: "United Arab Emirates",
    city: "Dubai",
    bio: "Loves finding great deals back home and sharing them with family.",
    verification: "verified",
    roles: ["shopper"],
  },
  {
    email: "karim.dual@findatraveller.demo",
    fullName: "Karim Hossain",
    country: "Bangladesh",
    city: "Chittagong",
    bio: "I travel often for work and also shop for friends abroad — happy to help either way.",
    verification: "verified",
    roles: ["traveller", "shopper"],
  },
  {
    email: "nusrat.traveller@findatraveller.demo",
    fullName: "Nusrat Jahan",
    country: "United Kingdom",
    city: "London",
    bio: "London-based, travelling home to Dhaka twice a year with plenty of spare luggage room.",
    verification: "verified",
    roles: ["traveller"],
  },
  {
    email: "admin@findatraveller.demo",
    fullName: "Find A Traveller Admin",
    country: "Bangladesh",
    city: "Dhaka",
    bio: "Platform administrator.",
    verification: "verified",
    roles: [],
    isAdmin: true,
  },
];

async function upsertDemoUser(config) {
  const { data: existing } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  let user = existing?.users?.find((u) => u.email === config.email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: config.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: config.fullName },
    });
    if (error) throw error;
    user = data.user;
    console.log(`Created auth user: ${config.email}`);
  } else {
    console.log(`Auth user already exists: ${config.email}`);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: config.fullName,
      country: config.country,
      city: config.city,
      bio: config.bio,
      verification_status: config.verification,
      is_admin: Boolean(config.isAdmin),
    })
    .eq("id", user.id);
  if (profileError) throw profileError;

  for (const role of config.roles ?? []) {
    await supabase.from("user_roles").upsert({ user_id: user.id, role }, { onConflict: "user_id,role" });
  }

  return user.id;
}

async function getCategoryIds() {
  const { data } = await supabase.from("categories").select("id, name");
  return Object.fromEntries((data ?? []).map((c) => [c.name, c.id]));
}

async function main() {
  console.log("Seeding Find A Traveller demo data...\n");

  const ids = {};
  for (const user of DEMO_USERS) {
    ids[user.email] = await upsertDemoUser(user);
  }

  const ahmed = ids["ahmed.traveller@findatraveller.demo"];
  const fatima = ids["fatima.shopper@findatraveller.demo"];
  const karim = ids["karim.dual@findatraveller.demo"];
  const nusrat = ids["nusrat.traveller@findatraveller.demo"];

  const categories = await getCategoryIds();

  const inTwoWeeks = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  console.log("\nCreating traveller posts (Luggage Sharing)...");
  const travellerPosts = [
    {
      traveller_id: ahmed,
      origin_country: "Bangladesh",
      origin_city: "Dhaka",
      destination_country: "United Arab Emirates",
      destination_city: "Dubai",
      departure_date: inTwoWeeks(10),
      return_date: inTwoWeeks(17),
      trip_type: "round_way",
      transport_type: "plane",
      capacity_kg: 19,
      remaining_capacity_kg: 19,
      price_per_kg_cents: 1000,
      notes: "Frequent business traveller with extra luggage allowance. I travel this route monthly for work and always have extra space. I'm very careful with other people's belongings and have insurance coverage.",
      rules: "No fragile items. Items must be properly packed. Meet at airport 2 hours before flight. Payment required upfront.",
      insurance_info: "Covered up to $200 per item.",
      status: "active",
      categoryNames: ["Documents", "Electronics", "Gifts"],
    },
    {
      traveller_id: karim,
      origin_country: "Bangladesh",
      origin_city: "Chittagong",
      destination_country: "Canada",
      destination_city: "Toronto",
      departure_date: inTwoWeeks(20),
      trip_type: "one_way",
      transport_type: "plane",
      capacity_kg: 15,
      remaining_capacity_kg: 15,
      price_per_kg_cents: 1500,
      notes: "Relocating temporarily for work — happy to carry documents, clothing, or small gifts.",
      rules: "No liquids over 100ml. No perishables.",
      status: "active",
      categoryNames: ["Clothing", "Documents", "Gifts"],
    },
    {
      traveller_id: nusrat,
      origin_country: "United Kingdom",
      origin_city: "London",
      destination_country: "Bangladesh",
      destination_city: "Dhaka",
      departure_date: inTwoWeeks(25),
      return_date: inTwoWeeks(35),
      trip_type: "round_way",
      transport_type: "plane",
      capacity_kg: 20,
      remaining_capacity_kg: 20,
      price_per_kg_cents: 900,
      notes: "Visiting family — plenty of extra suitcase space both ways.",
      rules: "No electronics over $500 value without prior discussion.",
      status: "active",
      categoryNames: ["Books", "Clothing", "Gifts"],
    },
    {
      traveller_id: ahmed,
      origin_country: "United Arab Emirates",
      origin_city: "Dubai",
      destination_country: "Bangladesh",
      destination_city: "Dhaka",
      departure_date: inTwoWeeks(17),
      trip_type: "one_way",
      transport_type: "plane",
      capacity_kg: 18,
      remaining_capacity_kg: 18,
      price_per_kg_cents: 1100,
      notes: "Return leg of my Dhaka-Dubai route.",
      status: "active",
      categoryNames: ["Electronics", "Luxury"],
    },
    {
      traveller_id: karim,
      origin_country: "India",
      origin_city: "Mumbai",
      destination_country: "United Arab Emirates",
      destination_city: "Dubai",
      departure_date: inTwoWeeks(12),
      trip_type: "one_way",
      transport_type: "plane",
      capacity_kg: 12,
      remaining_capacity_kg: 12,
      price_per_kg_cents: 1200,
      notes: "Short business trip, limited but reliable space.",
      status: "active",
      categoryNames: ["Documents", "Other"],
    },
  ];

  const postIds = [];
  for (const post of travellerPosts) {
    const { categoryNames, ...row } = post;
    const { data, error } = await supabase.from("traveller_posts").insert(row).select().single();
    if (error) throw error;
    postIds.push(data.id);
    const catRows = categoryNames.map((name) => ({ post_id: data.id, category_id: categories[name] })).filter((r) => r.category_id);
    if (catRows.length) await supabase.from("traveller_post_categories").insert(catRows);
    console.log(`  ${post.origin_city} -> ${post.destination_city} (${post.traveller_id === ahmed ? "Ahmed" : post.traveller_id === karim ? "Karim" : "Nusrat"})`);
  }

  console.log("\nCreating ship requests...");
  const shipRequests = [
    {
      shopper_id: fatima,
      origin_country: "United Arab Emirates",
      origin_city: "Dubai",
      destination_country: "Bangladesh",
      destination_city: "Dhaka",
      item_description: "iPhone 15 Pro (sealed, factory box) with receipt",
      quantity: 1,
      weight_kg: 0.5,
      item_value_cents: 120000,
      deadline: inTwoWeeks(14),
      proposed_payment_cents: 20000,
      transport_preference: "plane",
      notes: "Please ensure it's factory sealed and comes with a valid UAE receipt. Open to price discussion.",
      status: "active",
      categoryNames: ["Electronics"],
    },
    {
      shopper_id: karim,
      origin_country: "Bangladesh",
      origin_city: "Dhaka",
      destination_country: "Canada",
      destination_city: "Toronto",
      item_description: "Traditional Jamdani saree for a family wedding",
      quantity: 2,
      weight_kg: 1.2,
      item_value_cents: 30000,
      deadline: inTwoWeeks(18),
      proposed_payment_cents: 8000,
      transport_preference: "plane",
      notes: "Please keep it folded flat in the provided box.",
      status: "active",
      categoryNames: ["Clothing"],
    },
  ];

  for (const request of shipRequests) {
    const { categoryNames, ...row } = request;
    const { data, error } = await supabase.from("ship_requests").insert(row).select().single();
    if (error) throw error;
    const catRows = categoryNames.map((name) => ({ request_id: data.id, category_id: categories[name] })).filter((r) => r.category_id);
    if (catRows.length) await supabase.from("ship_request_categories").insert(catRows);
    console.log(`  ${request.item_description}`);
  }

  console.log("\nCreating travel buddy posts...");
  await supabase.from("travel_buddy_posts").insert([
    {
      user_id: nusrat,
      origin_country: "United Kingdom",
      origin_city: "London",
      destination_country: "Bangladesh",
      destination_city: "Dhaka",
      travel_date: inTwoWeeks(25),
      return_date: inTwoWeeks(35),
      transport_type: "plane",
      preferences: "Non-smoker, prefers window seat",
      description: "Flying home for a family visit — happy to travel together or just chat during the layover.",
      status: "active",
    },
    {
      user_id: karim,
      origin_country: "Bangladesh",
      origin_city: "Chittagong",
      destination_country: "Canada",
      destination_city: "Toronto",
      travel_date: inTwoWeeks(20),
      transport_type: "plane",
      preferences: "Open to any seating",
      description: "First time flying this route, would love company.",
      status: "active",
    },
  ]);

  console.log("\nCreating a completed booking with reviews (for rating data)...");
  const completedPickup = inTwoWeeks(-20);
  const { data: completedBooking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      booking_number: `FAT-DEMO-${Date.now()}`,
      service_type: "luggage_sharing",
      shopper_id: fatima,
      traveller_id: ahmed,
      traveller_post_id: postIds[0],
      status: "completed",
      weight_kg: 3,
      item_description: "Documents and a laptop sleeve",
      quantity: 1,
      item_value_cents: 5000,
      pickup_location: "Dubai Marina, Dubai",
      delivery_location: "Gulshan, Dhaka",
      currency: "USD",
      item_price_cents: 3000,
      service_fee_cents: 240,
      platform_fee_cents: 100,
      total_cents: 3340,
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    })
    .select()
    .single();
  if (bookingError) throw bookingError;

  await supabase.from("reviews").insert([
    {
      booking_id: completedBooking.id,
      reviewer_id: fatima,
      reviewee_id: ahmed,
      rating: 5,
      comment: "Ahmed was extremely professional and took great care of my documents. Highly recommend!",
      created_at: completedPickup,
    },
    {
      booking_id: completedBooking.id,
      reviewer_id: ahmed,
      reviewee_id: fatima,
      rating: 5,
      comment: "Great communication, item was exactly as described.",
      created_at: completedPickup,
    },
  ]);

  console.log("\nSeed complete.\n");
  console.log("Demo accounts (password for all: Demo1234!):");
  for (const user of DEMO_USERS) {
    console.log(`  ${user.email}`);
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
