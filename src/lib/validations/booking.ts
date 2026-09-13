import { z } from "zod";

export const createLuggageBookingSchema = z.object({
  postId: z.string().uuid(),
  weightKg: z.coerce.number().positive("Weight must be greater than 0"),
  itemDescription: z.string().min(3, "Describe what you're shipping"),
  categoryId: z.string().uuid().optional(),
  quantity: z.coerce.number().int().positive().default(1),
  itemValueCents: z.coerce.number().int().min(0).default(0),
  pickupLocation: z.string().min(3, "Enter a pickup location"),
  deliveryLocation: z.string().min(3, "Enter a delivery location"),
  preferredDeliveryDate: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export const createOfferSchema = z.object({
  requestId: z.string().uuid(),
  priceCents: z.coerce.number().int().positive("Enter an offer amount"),
  weightKg: z.coerce.number().positive(),
  deliveryConditions: z.string().optional(),
  notes: z.string().optional(),
  pickupLocation: z.string().min(3),
  deliveryLocation: z.string().min(3),
});

export const counterOfferSchema = z.object({
  bookingId: z.string().uuid(),
  priceCents: z.coerce.number().int().positive(),
  weightKg: z.coerce.number().positive(),
  deliveryConditions: z.string().optional(),
  notes: z.string().optional(),
});

export const pickupConfirmationSchema = z.object({
  bookingId: z.string().uuid(),
  condition: z.enum(["excellent", "good", "fair", "damaged"]),
  notes: z.string().optional(),
});

export const deliveryOtpSchema = z.object({
  bookingId: z.string().uuid(),
  code: z.string().length(6, "Enter the 6-digit code"),
});

export const reviewSchema = z.object({
  bookingId: z.string().uuid(),
  revieweeId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
});
