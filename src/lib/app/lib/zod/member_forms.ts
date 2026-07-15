import { z } from "zod";

export const insertMemberSchema = z.object({
  id: z
    .string()
    .min(1, "Student number is required")
    .regex(/^\d{4}\d{6}$/, "Student number must be in format ##########"),
  name: z.string().min(1, "Name is required"),
  program: z.string().min(1, "Program is required"),
  year: z.number().int().min(1).max(32767, "Year must be between 1 and 32767"),
  role: z.string().min(1, "Role is required"),
  committee: z
    .enum([
      "executive",
      "logistics",
      "financeAndBusiness",
      "productions",
      "memberships",
      "ardc",
      "creatives",
      "documentation",
      "publicRelations",
      "partnershipsAndSponsorships",
      "soccom",
    ])
    .optional()
    .nullable(),
  active_within_tenure: z.number().int().positive("Please select a tenure"),
});

export const updateMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  program: z.string().min(1, "Program is required"),
  year: z.number().int().min(1).max(32767, "Year must be between 1 and 32767"),
  role: z.string().min(1, "Role is required"),
  committee: z
    .enum([
      "executive",
      "logistics",
      "financeAndBusiness",
      "productions",
      "memberships",
      "ardc",
      "creatives",
      "documentation",
      "publicRelations",
      "partnershipsAndSponsorships",
      "soccom",
    ])
    .optional()
    .nullable(),
  active_within_tenure: z.number().int().positive("Please select a tenure"),
});

export type InsertMemberInput = z.infer<typeof insertMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
