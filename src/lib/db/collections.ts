import "server-only";
import { GridFSBucket } from "mongodb";
import { getDb } from "./mongo";
import type {
  AdminDoc,
  AppointmentDoc,
  ArticleDoc,
  ArticleCategoryDoc,
  ArticleTagDoc,
  AuditDoc,
  NotificationDoc,
  BranchDoc,
  ContactMessageDoc,
  MediaDoc,
  OrderDoc,
  PatientDoc,
  PrescriptionDoc,
  RateLimitDoc,
  SessionDoc,
  SubscriberDoc,
} from "./models";

/** Typed handles to every collection. Call once per request. */
export async function collections() {
  const db = await getDb();
  return {
    users: db.collection<PatientDoc>("users"),
    admins: db.collection<AdminDoc>("admins"),
    sessions: db.collection<SessionDoc>("sessions"),
    prescriptions: db.collection<PrescriptionDoc>("prescriptions"),
    auditLog: db.collection<AuditDoc>("audit_log"),
    rateLimits: db.collection<RateLimitDoc>("rate_limits"),
    articles: db.collection<ArticleDoc>("articles"),
    branches: db.collection<BranchDoc>("branches"),
    subscribers: db.collection<SubscriberDoc>("subscribers"),
    contactMessages: db.collection<ContactMessageDoc>("contact_messages"),
    appointments: db.collection<AppointmentDoc>("appointments"),
    orders: db.collection<OrderDoc>("orders"),
    media: db.collection<MediaDoc>("media"),
    articleCategories: db.collection<ArticleCategoryDoc>("article_categories"),
    articleTags: db.collection<ArticleTagDoc>("article_tags"),
    notifications: db.collection<NotificationDoc>("notifications"),
  };
}

/** GridFS keeps prescription files in the same Atlas cluster as the records. */
export async function prescriptionBucket(): Promise<GridFSBucket> {
  return new GridFSBucket(await getDb(), { bucketName: "prescriptionFiles" });
}
