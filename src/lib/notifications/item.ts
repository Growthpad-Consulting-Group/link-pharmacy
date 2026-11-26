// The notification as sent to the admin screens. Pure, so both the Next.js server and the realtime
// WebSocket process can use it.
import type { NotificationDoc, NotificationType } from "@/lib/db/models";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  read: boolean;
};

export function toNotificationItem(doc: NotificationDoc, adminId: string): NotificationItem {
  return {
    id: doc._id.toHexString(),
    type: doc.type,
    title: doc.title,
    body: doc.body,
    href: doc.href,
    createdAt: doc.createdAt.toISOString(),
    read: doc.readBy.includes(adminId),
  };
}
