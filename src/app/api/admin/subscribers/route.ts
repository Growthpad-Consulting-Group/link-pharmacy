import { NextResponse } from "next/server";
import type { Filter } from "mongodb";
import { authorize } from "@/lib/admin/session";
import { PAGE_SIZE, pageFrom, searchPattern } from "@/lib/admin/views";
import { collections } from "@/lib/db/collections";
import type { SubscriberDoc } from "@/lib/db/models";

/** Newsletter subscribers, newest first. */
export async function GET(request: Request) {
  const auth = await authorize("messages:read");
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const status = url.searchParams.get("status");
  const filter: Filter<SubscriberDoc> = {};
  if (q) filter.email = searchPattern(q);
  if (status === "subscribed" || status === "unsubscribed") filter.status = status;

  const { subscribers } = await collections();
  const page = pageFrom(url);
  const [docs, total, subscribed] = await Promise.all([
    subscribers.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).toArray(),
    subscribers.countDocuments(filter),
    subscribers.countDocuments({ status: "subscribed" }),
  ]);

  return NextResponse.json({
    subscribers: docs.map((doc) => ({
      email: doc.email,
      status: doc.status,
      source: doc.source,
      createdAt: doc.createdAt.toISOString(),
    })),
    total,
    subscribed,
    page,
    pageSize: PAGE_SIZE,
  });
}
