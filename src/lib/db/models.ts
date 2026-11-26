import type { ObjectId } from "mongodb";

// Plain types shared by server code and client components. Safe to import from either side.

export const PRESCRIPTION_STATUSES = ["received", "in_review", "ready", "dispensed", "rejected"] as const;
export type PrescriptionStatus = (typeof PRESCRIPTION_STATUSES)[number];

export const ADMIN_ROLES = ["doctor", "pharmacist", "staff"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export type SessionKind = "patient" | "admin";

export type PatientDoc = {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  medicalAid: string;
  allergies: string;
  emergencyContact: string;
  /** Public address of the profile photo in R2. */
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminDoc = {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  active: boolean;
  /** Public address of the profile photo in R2. */
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

/** A staff account as the admin screens see it. */
export type AdminView = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  avatarUrl: string | null;
  createdAt: string;
};

export function toAdminView(doc: Omit<AdminDoc, "passwordHash">): AdminView {
  return {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    active: doc.active,
    avatarUrl: doc.avatarUrl ?? null,
    createdAt: doc.createdAt.toISOString(),
  };
}

/** One fixed time window of a rate limit. Expires by itself through a TTL index. */
export type RateLimitDoc = {
  _id: string;
  count: number;
  expiresAt: Date;
};

/** Contact details given with a prescription by someone without a portal account. */
export type Guest = { name: string; email: string; phone: string };

export type StatusEntry = { status: PrescriptionStatus; note: string; by: string; at: Date };

export type PrescriptionDoc = {
  _id: string;
  reference: string;
  patientId: string | null;
  guest: Guest | null;
  fileId: ObjectId;
  originalName: string;
  contentType: string;
  size: number;
  notes: string;
  status: PrescriptionStatus;
  statusHistory: StatusEntry[];
  createdAt: Date;
  updatedAt: Date;
};

export type SessionDoc = {
  _id: string;
  kind: SessionKind;
  subjectId: string;
  expiresAt: Date;
};

export type AuditDoc = {
  at: Date;
  adminId: string;
  action: string;
  target: string;
  detail: string;
};

/** A patient document without the password hash. */
export type PatientRecord = Omit<PatientDoc, "passwordHash">;

export type PatientView = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  medicalAid: string;
  allergies: string;
  emergencyContact: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toPatientView(doc: PatientRecord): PatientView {
  return {
    id: doc._id,
    avatarUrl: doc.avatarUrl ?? null,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    dateOfBirth: doc.dateOfBirth,
    address: doc.address,
    medicalAid: doc.medicalAid,
    allergies: doc.allergies,
    emergencyContact: doc.emergencyContact,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// ---- Site content -------------------------------------------------------

export type ArticleBlock = { type: "p" | "h2" | "ul"; text?: string; items?: string[] };

export type ArticleDoc = {
  _id: string; // slug
  title: string;
  excerpt: string;
  category: string;
  date: string; // YYYY-MM-DD
  readTime: string;
  image: string;
  /** Lower-case tag names. Managed in the admin "Categories & tags" screen. */
  tags?: string[];
  /** Sanitized rich-text HTML written by the editor. Articles created before the editor have `body` instead. */
  html?: string;
  /** Legacy block content, converted to HTML when read. Removed the next time an article is saved. */
  body?: ArticleBlock[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ArticleCategoryDoc = {
  _id: string; // slug of the name, stable for the life of the category
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ArticleTagDoc = {
  _id: string; // the tag itself, lower-case
  name: string;
  createdAt: Date;
};

// ---- Admin notifications --------------------------------------------------

export const NOTIFICATION_TYPES = ["prescription", "message", "appointment", "order", "subscriber"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationDoc = {
  _id: ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  /** Only admins holding this permission receive the notification. */
  permission: string;
  /** Admin ids that have marked this notification as read. */
  readBy: string[];
  createdAt: Date;
};

export type MediaDoc = {
  _id: string; // object key in R2
  url: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadedBy: string;
  createdAt: Date;
};

export type BranchDoc = {
  _id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  services: string[];
  createdAt: Date;
  updatedAt: Date;
};

// ---- Inbox --------------------------------------------------------------

export const CONTACT_STATUSES = ["new", "handled"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const APPOINTMENT_STATUSES = ["new", "contacted", "booked", "closed"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type ContactMessageDoc = {
  _id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type AppointmentDoc = {
  _id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type SubscriberDoc = {
  _id: string; // lower-cased email
  email: string;
  status: "subscribed" | "unsubscribed";
  source: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderDoc = {
  _id: string;
  reference: string;
  customer: { name: string; email: string; phone: string; street: string; city: string; zip: string };
  lines: { productId: number; quantity: number }[];
  total: number;
  currency: string;
  demo: boolean;
  createdAt: Date;
};

/** What a patient sees about their own prescription. Never includes file ids or other patients' data. */
export type PrescriptionView = {
  reference: string;
  originalName: string;
  size: number;
  notes: string;
  status: PrescriptionStatus;
  createdAt: string;
  updatedAt: string;
};

export function toPrescriptionView(doc: PrescriptionDoc): PrescriptionView {
  return {
    reference: doc.reference,
    originalName: doc.originalName,
    size: doc.size,
    notes: doc.notes,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
