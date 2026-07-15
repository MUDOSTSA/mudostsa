import { z } from "zod";

// Schema for inserting new inventory items
export const insertInventoryItemSchema = z.object({
  name: z
    .string()
    .min(1, "Item name is required")
    .max(100, "Item name must be less than 100 characters")
    .trim(),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .trim()
    .optional(),

  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative")
    .max(1000000, "Quantity is too large"),

  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location must be less than 100 characters")
    .trim(),

  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must be less than 50 characters")
    .trim(),
});

// Type export for use in components
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
