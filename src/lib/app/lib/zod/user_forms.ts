import { z } from "zod";

export const editAccountSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string().min(1, "Display name is required"),
  positionTitle: z.string().min(1, "Position title is required"),
});

export type EditAccountForm = z.infer<typeof editAccountSchema>;

const spasIDRegex = /^U-[A-Za-z0-9]{4}-[A-Za-z0-9]+-[A-Za-z0-9]+$/;
const contactNumberRegex = /^0\d{10}$/;
export const sensitiveDataSchema = z.object({
  landbank_account: z.string().optional().or(z.literal("")), // Allow empty string to clear the Landbank account
  spas_id: z
    .string()
    .regex(spasIDRegex, {
      message: "SPAS ID is invalid. Follow the format: U-XXXX-XX-XXXXX",
    })
    .optional()
    .or(z.literal("")), // Allow empty string to clear the SPAS ID
  contact_number: z
    .string()
    .regex(contactNumberRegex, {
      message:
        "Contact number is invalid. Enter a valid 11-digit phone number starting with 0.",
    })
    .optional()
    .or(z.literal("")), // Allow empty string to clear the contact number
  school_email: z
    .email()
    .endsWith("@mymail.mapua.edu.ph", {
      message: "School email must end with @mymail.mapua.edu.ph",
    })
    .optional()
    .or(z.literal("")), // Allow empty string to clear the school email
  signature: z
    .string()
    .startsWith("data:image/png;base64,", {
      message: "Invalid signature format. Please draw a new signature.",
    })
    .optional()
    .or(z.literal("")), // Allow empty string to clear the signature
});

export type SensitiveDataForm = z.infer<typeof sensitiveDataSchema>;
