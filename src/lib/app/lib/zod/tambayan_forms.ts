import { z } from "zod";

// Schema for inserting new tambayan schedule items
export const insertTambayanScheduleSchema = z.object({
  room: z
    .string()
    .min(1, "Room name is required")
    .max(100, "Room name must be less than 100 characters")
    .trim(),

  campus: z
    .string()
    .min(1, "Campus is required")
    .max(50, "Campus must be less than 50 characters")
    .trim(),

  time_start: z.string().min(1, "Start time is required"),

  time_end: z.string().min(1, "End time is required"),
});

// Type export for use in components
export type InsertTambayanSchedule = z.infer<
  typeof insertTambayanScheduleSchema
>;
