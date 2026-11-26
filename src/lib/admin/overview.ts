import "server-only";
import { collections } from "@/lib/db/collections";
import { PRESCRIPTION_STATUSES, type PrescriptionStatus } from "@/lib/db/models";
import type { CurrentAdmin } from "./session";
import type { Permission } from "./permissions";

export type OverviewData = {
  generatedAt: string;
  /** Each section is null when the signed-in role may not see it. */
  prescriptions: null | {
    byStatus: Record<PrescriptionStatus, number>;
    receivedToday: number;
    trend: { date: string; count: number }[];
    recent: { reference: string; originalName: string; status: PrescriptionStatus; createdAt: string }[];
  };
  inbox: null | {
    newMessages: number;
    newAppointments: number;
    messagesThisWeek: number;
    subscribers: number;
    newSubscribersThisWeek: number;
  };
  orders: null | { last30Days: number; revenue: { currency: string; amount: number }[] };
  content: null | { published: number; drafts: number };
  staff: null | { active: number };
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Headline numbers for the admin overview. Counts are by UTC day. Only the sections the admin's role
 * can see are queried.
 */
export async function getOverview(admin: CurrentAdmin): Promise<OverviewData> {
  const has = (permission: Permission) => admin.permissions.includes(permission);
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const trendStart = new Date(startOfToday.getTime() - 13 * DAY_MS);
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
  const monthAgo = new Date(now.getTime() - 30 * DAY_MS);
  const c = await collections();

  const [prescriptions, inbox, orders, content, staff] = await Promise.all([
    has("prescriptions:read") ? loadPrescriptions(startOfToday, trendStart) : null,
    has("messages:read") ? loadInbox(weekAgo) : null,
    has("messages:read") ? loadOrders(monthAgo) : null,
    has("content:manage") ? loadContent() : null,
    has("admins:manage") ? c.admins.countDocuments({ active: true }).then((active) => ({ active })) : null,
  ]);

  return { generatedAt: now.toISOString(), prescriptions, inbox, orders, content, staff };

  async function loadPrescriptions(todayStart: Date, from: Date): Promise<OverviewData["prescriptions"]> {
    const { prescriptions } = c;
    const [statusRows, dayRows, receivedToday, recentDocs] = await Promise.all([
      prescriptions.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray(),
      prescriptions
        .aggregate<{ _id: string; count: number }>([
          { $match: { createdAt: { $gte: from } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        ])
        .toArray(),
      prescriptions.countDocuments({ createdAt: { $gte: todayStart } }),
      prescriptions
        .find({}, { projection: { reference: 1, originalName: 1, status: 1, createdAt: 1 } })
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray(),
    ]);

    const byStatus = Object.fromEntries(PRESCRIPTION_STATUSES.map((status) => [status, 0])) as Record<PrescriptionStatus, number>;
    for (const row of statusRows) {
      if (row._id in byStatus) byStatus[row._id as PrescriptionStatus] = row.count;
    }

    const perDay = new Map(dayRows.map((row) => [row._id, row.count]));
    const trend = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(from.getTime() + index * DAY_MS).toISOString().slice(0, 10);
      return { date, count: perDay.get(date) ?? 0 };
    });

    return {
      byStatus,
      receivedToday,
      trend,
      recent: recentDocs.map((doc) => ({
        reference: doc.reference,
        originalName: doc.originalName,
        status: doc.status,
        createdAt: doc.createdAt.toISOString(),
      })),
    };
  }

  async function loadInbox(weekStart: Date): Promise<OverviewData["inbox"]> {
    const [newMessages, newAppointments, messagesThisWeek, subscribers, newSubscribersThisWeek] = await Promise.all([
      c.contactMessages.countDocuments({ status: "new" }),
      c.appointments.countDocuments({ status: "new" }),
      c.contactMessages.countDocuments({ createdAt: { $gte: weekStart } }),
      c.subscribers.countDocuments({ status: "subscribed" }),
      c.subscribers.countDocuments({ createdAt: { $gte: weekStart } }),
    ]);
    return { newMessages, newAppointments, messagesThisWeek, subscribers, newSubscribersThisWeek };
  }

  async function loadOrders(from: Date): Promise<OverviewData["orders"]> {
    const rows = await c.orders
      .aggregate<{ _id: string; amount: number; count: number }>([
        { $match: { createdAt: { $gte: from } } },
        { $group: { _id: "$currency", amount: { $sum: "$total" }, count: { $sum: 1 } } },
      ])
      .toArray();
    return {
      last30Days: rows.reduce((sum, row) => sum + row.count, 0),
      revenue: rows.map((row) => ({ currency: row._id, amount: Math.round(row.amount * 100) / 100 })),
    };
  }

  async function loadContent(): Promise<OverviewData["content"]> {
    const [published, drafts] = await Promise.all([
      c.articles.countDocuments({ published: true }),
      c.articles.countDocuments({ published: false }),
    ]);
    return { published, drafts };
  }
}
