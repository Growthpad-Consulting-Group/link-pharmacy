import { z } from "zod";
import { ADMIN_ROLES, PRESCRIPTION_STATUSES } from "@/lib/db/models";

// Shared between route handlers (validation) and forms (field messages).
const name = z.string().trim().min(2, "Enter your full name").max(120);
const phone = z.string().trim().min(6, "Enter a valid phone number").max(40);
const email = z.email("Enter a valid email address").max(200).transform((value) => value.toLowerCase());

export const registerSchema = z.object({
  name,
  email,
  phone,
  password: z.string().min(8, "Use at least 8 characters").max(200),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(200),
});

export const profileSchema = z.object({
  name,
  phone,
  dateOfBirth: z.union([z.literal(""), z.iso.date("Use the format YYYY-MM-DD")]),
  address: z.string().trim().max(300),
  medicalAid: z.string().trim().max(120),
  allergies: z.string().trim().max(500),
  emergencyContact: z.string().trim().max(120),
});

export const portalPrescriptionSchema = z.object({
  notes: z.string().trim().max(1000),
  consent: z.literal("true", { error: "Please confirm consent to continue" }),
});

export const guestPrescriptionSchema = z.object({
  name,
  email,
  phone,
  notes: z.string().trim().max(1000),
  consent: z.literal("true", { error: "Please confirm consent to continue" }),
});

export const adminSetupSchema = z.object({
  name,
  email,
  password: z.string().min(12, "Use at least 12 characters for admin passwords").max(200),
});

export const adminCreateSchema = z.object({
  name,
  email,
  role: z.enum(ADMIN_ROLES, { error: "Choose a role" }),
  password: z.string().min(12, "Use at least 12 characters for admin passwords").max(200),
});

export const adminUpdateSchema = z
  .object({
    role: z.enum(ADMIN_ROLES, { error: "Choose a role" }).optional(),
    active: z.boolean().optional(),
    password: z.string().min(12, "Use at least 12 characters for admin passwords").max(200).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "Nothing to change" });

export const adminLoginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(200),
});

export const prescriptionStatusSchema = z.object({
  status: z.enum(PRESCRIPTION_STATUSES, { error: "Choose a valid status" }),
  note: z.string().trim().max(500).default(""),
});

/** Turns zod issues into { fieldName: [messages] } for the forms. */
export function issuesFrom(error: z.ZodError): Record<string, string[]> {
  const issues: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path.at(-1) ?? "form");
    (issues[key] ??= []).push(issue.message);
  }
  return issues;
}
