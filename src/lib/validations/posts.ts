import { z } from "zod";
import { unitsToCents } from "@/lib/money";

export const createTravellerPostSchema = z.object({
  originCountry: z.string().min(2),
  originCity: z.string().min(1),
  destinationCountry: z.string().min(2),
  destinationCity: z.string().min(1),
  departureDate: z.string().min(1, "Select a departure date"),
  returnDate: z.string().optional(),
  tripType: z.enum(["one_way", "round_way"]),
  transportType: z.enum(["plane", "train", "bus", "car"]),
  capacityKg: z.coerce.number().positive("Enter available capacity"),
  pricePerKgUsd: z.coerce.number().positive("Enter a price per kg").transform(unitsToCents),
  notes: z.string().optional(),
  rules: z.string().optional(),
  insuranceInfo: z.string().optional(),
  categoryIds: z.array(z.string().uuid()).default([]),
});

export const createShipRequestSchema = z.object({
  originCountry: z.string().min(2),
  originCity: z.string().min(1),
  destinationCountry: z.string().min(2),
  destinationCity: z.string().min(1),
  itemDescription: z.string().min(3),
  quantity: z.coerce.number().int().positive().default(1),
  weightKg: z.coerce.number().positive(),
  // The form speaks dollars because people do; the database stays in
  // integer cents, so the conversion happens once, here.
  itemValueUsd: z.coerce.number().min(0).default(0).transform(unitsToCents),
  deadline: z.string().optional(),
  proposedPaymentUsd: z.coerce.number().positive("Enter what you will pay the traveller").transform(unitsToCents),
  transportPreference: z.enum(["plane", "train", "bus", "car"]).optional(),
  notes: z.string().optional(),
  categoryIds: z.array(z.string().uuid()).default([]),
});

/** Who to attribute a guest post to, and where to send its offers. */
export const guestPosterSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});
