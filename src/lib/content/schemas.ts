import { z } from "zod";
import { SERVICES } from "@/lib/branches";
import { APPOINTMENT_STATUSES, CONTACT_STATUSES } from "@/lib/db/models";
import { htmlToText, sanitizeArticleHtml } from "./html";
import { TAG_MAX_LENGTH, normaliseTag } from "./names";

const slug = z
  .string()
  .trim()
  .min(3, "Use at least 3 characters")
  .max(120)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lower-case letters, numbers and hyphens only")
  .refine((value) => value !== "new", "“new” is reserved, choose another address");

export const articleSchema = z.object({
  slug: slug.optional(),
  title: z.string().trim().min(3, "Enter a title").max(160),
  excerpt: z.string().trim().min(10, "Write a short summary").max(400),
  // Checked against the category list in the database by the route, since categories are now managed.
  category: z.string().trim().min(1, "Choose a category").max(60),
  tags: z
    .array(z.string().max(100))
    .max(20, "Use up to 20 tags")
    .transform((list) => [...new Set(list.map(normaliseTag).filter(Boolean))])
    .refine((list) => list.every((tag) => tag.length <= TAG_MAX_LENGTH), `Tags can be at most ${TAG_MAX_LENGTH} characters`),
  date: z.iso.date("Use the format YYYY-MM-DD"),
  readTime: z.string().trim().min(3).max(30),
  image: z
    .string()
    .trim()
    .max(500)
    .refine((value) => value.startsWith("/") || value.startsWith("https://"), "Choose an image from the media library"),
  html: z
    .string()
    .max(200_000, "The article is too long")
    .transform((value) => sanitizeArticleHtml(value))
    .refine((value) => htmlToText(value).length > 0, "Add some article text"),
  published: z.boolean(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Use at least 2 characters").max(60, "Use 60 characters or fewer"),
});

export const tagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters")
    .max(TAG_MAX_LENGTH, `Use ${TAG_MAX_LENGTH} characters or fewer`),
});

export const branchSchema = z.object({
  id: slug.optional(),
  name: z.string().trim().min(3).max(120),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(40),
  hours: z.string().trim().min(3).max(200),
  services: z.array(z.enum(SERVICES)).max(SERVICES.length),
});

export const subscribeSchema = z.object({
  email: z.email("Enter a valid email address").max(200).transform((value) => value.toLowerCase()),
  consent: z.literal("true", { error: "Please confirm you want to receive emails" }),
});

export const contactStatusSchema = z.object({ status: z.enum(CONTACT_STATUSES) });
export const appointmentStatusSchema = z.object({ status: z.enum(APPOINTMENT_STATUSES) });
export const subscriberStatusSchema = z.object({ status: z.enum(["subscribed", "unsubscribed"]) });
