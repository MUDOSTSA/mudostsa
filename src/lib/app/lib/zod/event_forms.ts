import { z } from "zod";
import { id } from "zod/locales";

// Schema for creating new event items
export const createEventItemSchema = z.object({
  title: z
    .string()
    .min(1, "Event title is required")
    .max(100, "Event title must be less than 100 characters")
    .trim(),

  description: z
    .string()
    .min(1, "Event description is required")
    .max(1000, "Description must be less than 1000 characters")
    .trim(),

  start: z.string().min(1, "Event start date is required"),
  venue: z.string().trim().optional(),
  end: z.string().min(1, "Event end date is required"),

  facilitators: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, "Facilitator name is required")
          .max(100, "Facilitator name must be less than 100 characters")
          .trim(),
        id: z.coerce.string().min(1, "Facilitator ID is required").trim(),
      }),
    )
    .refine(
      (f) => {
        //ID should be unique across the array
        //ID is always present and non-empty due to the schema, so we can safely check for uniqueness
        const ids = f.map((facilitator) => facilitator.id);
        const uniqueIds = new Set(ids);
        return ids.length === uniqueIds.size;
      },
      { message: "Duplicate facilitators not allowed" },
    ),
  registrationLink: z.url("Registration link must be a valid URL").optional(),
  facebookLink: z.url("Facebook link must be a valid URL").optional(),
});

// Type export for use in components
export type CreateEventItem = z.infer<typeof createEventItemSchema>;
