import { z } from "zod";

export const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),

  phone: z
    .string()
    .trim()
    .min(10, "Please enter a valid phone number")
    .max(15, "Phone number is too long"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),

  addressLine1: z
    .string()
    .trim()
    .min(5, "Please enter a valid street address")
    .max(200, "Address is too long"),

  addressLine2: z
    .string()
    .trim()
    .max(200, "Address is too long")
    .optional()
    .or(z.literal("")),

  city: z
    .string()
    .trim()
    .min(2, "City is required")
    .max(100, "City name is too long"),

  state: z
    .string()
    .trim()
    .min(2, "State is required")
    .max(100, "State name is too long"),

  country: z
    .string()
    .trim()
    .min(2, "Country is required")
    .max(100, "Country name is too long"),

  postalCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Please enter a valid 6-digit pincode"),

  isDefault: z.boolean(),
});

export type AddressInput = z.infer<typeof addressSchema>;