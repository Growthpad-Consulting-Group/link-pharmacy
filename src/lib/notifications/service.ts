import "server-only";
import { ObjectId, type Filter } from "mongodb";
import type { Permission } from "@/lib/admin/permissions";
import { collections } from "@/lib/db/collections";
import type { NotificationDoc, NotificationType } from "@/lib/db/models";
import { toNotificationItem, type NotificationItem } from "./item";

export type NewNotification = {
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  permission: Permission;
};

/**
 * Records an event for the admin team. Never throws: a notification problem must not fail the
 * patient's or customer's request that caused it.
 */
export async function notify(input: NewNotification): Promise<void> {
  try {
    const { notifications } = await collections();
    await notifications.insertOne({
      _id: new ObjectId(),
      ...input,
      body: input.body.slice(0, 300),
      readBy: [],
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("[notify] could not record notification:", error);
  }
}

/** The newest notifications this admin is allowed to see, and how many of them are unread. */
export async function listNotifications(adminId: string, permissions: Permission[]): Promise<{ items: NotificationItem[]; unread: number }> {
  const { notifications } = await collections();
  const scope = { permission: { $in: permissions } };
  const docs = await notifications.find(scope).sort({ createdAt: -1 }).limit(30).toArray();
  const unread = await notifications.countDocuments({ ...scope, readBy: { $ne: adminId } });
  return { items: docs.map((doc) => toNotificationItem(doc, adminId)), unread };
}

/** Marks the given notifications as read for this admin, or every visible one when `ids` is null. */
export async function markNotificationsRead(adminId: string, permissions: Permission[], ids: ObjectId[] | null): Promise<void> {
  const { notifications } = await collections();
  const filter: Filter<NotificationDoc> = { permission: { $in: permissions }, readBy: { $ne: adminId } };
  if (ids) filter._id = { $in: ids };
  await notifications.updateMany(filter, { $addToSet: { readBy: adminId } });
}
