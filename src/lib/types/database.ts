// Hand-written types mirroring supabase/migrations/*.sql.
// If the schema changes, update this file in the same commit.

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
export type TripType = "one_way" | "round_way";
export type TransportType = "plane" | "train" | "bus" | "car";
export type TravellerPostStatus =
  | "draft"
  | "active"
  | "paused"
  | "fully_booked"
  | "expired"
  | "cancelled"
  | "completed";
export type ShipRequestStatus =
  | "draft"
  | "active"
  | "offer_received"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired";
export type OfferStatus = "pending" | "accepted" | "rejected" | "countered" | "expired" | "cancelled";
export type BookingStatus =
  | "requested"
  | "offer_pending"
  | "accepted"
  | "payment_pending"
  | "paid"
  | "pickup_pending"
  | "pickup_confirmed"
  | "in_transit"
  | "delivery_pending"
  | "otp_pending"
  | "delivered"
  | "completed"
  | "rejected"
  | "cancelled"
  | "expired"
  | "disputed";
export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "refunded" | "partially_refunded";
export type ItemCondition = "excellent" | "good" | "fair" | "damaged";
export type BookingServiceType = "luggage_sharing" | "ship_request";
export type OfferRole = "shopper" | "traveller";
export type ReportTargetType = "user" | "post" | "booking" | "message";
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export interface Profile {
  id: string;
  full_name: string;
  display_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  verification_status: VerificationStatus;
  average_rating: number;
  total_reviews: number;
  is_admin: boolean;
  is_suspended: boolean;
  email_notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface TravellerPost {
  id: string;
  traveller_id: string;
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  departure_date: string;
  return_date: string | null;
  trip_type: TripType;
  transport_type: TransportType;
  capacity_kg: number;
  remaining_capacity_kg: number;
  price_per_kg_cents: number;
  currency: string;
  notes: string | null;
  rules: string | null;
  insurance_info: string | null;
  status: TravellerPostStatus;
  created_at: string;
  updated_at: string;
  traveller?: Profile;
  categories?: Category[];
}

export interface ShipRequest {
  id: string;
  shopper_id: string;
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  item_description: string;
  quantity: number;
  weight_kg: number;
  item_value_cents: number;
  deadline: string | null;
  proposed_payment_cents: number;
  currency: string;
  transport_preference: TransportType | null;
  notes: string | null;
  image_url: string | null;
  status: ShipRequestStatus;
  created_at: string;
  updated_at: string;
  shopper?: Profile;
  categories?: Category[];
}

export interface Booking {
  id: string;
  booking_number: string;
  service_type: BookingServiceType;
  shopper_id: string;
  traveller_id: string;
  traveller_post_id: string | null;
  ship_request_id: string | null;
  status: BookingStatus;
  weight_kg: number;
  item_description: string;
  quantity: number;
  item_value_cents: number;
  pickup_location: string;
  delivery_location: string;
  preferred_delivery_date: string | null;
  special_instructions: string | null;
  currency: string;
  item_price_cents: number;
  service_fee_cents: number;
  platform_fee_cents: number;
  total_cents: number;
  cancelled_reason: string | null;
  created_at: string;
  updated_at: string;
  shopper?: Profile;
  traveller?: Profile;
  traveller_post?: TravellerPost;
  ship_request?: ShipRequest;
}

export interface Offer {
  id: string;
  booking_id: string;
  made_by: string;
  role: OfferRole;
  price_cents: number;
  weight_kg: number;
  delivery_conditions: string | null;
  notes: string | null;
  parent_offer_id: string | null;
  status: OfferStatus;
  expires_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  payer_id: string;
  amount_cents: number;
  currency: string;
  service_fee_cents: number;
  platform_fee_cents: number;
  payment_method: string;
  status: PaymentStatus;
  transaction_reference: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  image_url: string | null;
  read_at: string | null;
  created_at: string;
  sender?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}
