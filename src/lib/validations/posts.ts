import { z } from "zod";

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
  pricePerKgCents: z.coerce.number().int().positive("Enter a price per kg"),
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
  itemValueCents: z.coerce.number().int().min(0).default(0),
  deadline: z.string().optional(),
  proposedPaymentCents: z.coerce.number().int().positive("Enter a proposed payment"),
  transportPreference: z.enum(["plane", "train", "bus", "car"]).optional(),
  notes: z.string().optional(),
  categoryIds: z.array(z.string().uuid()).default([]),
});
