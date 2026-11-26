import { NextResponse } from "next/server";
import { collections } from "@/lib/db/collections";
import { notify } from "@/lib/notifications/service";
import { subscribeSchema } from "@/lib/content/schemas";
import { issuesFrom } from "@/lib/portal/schemas";
import { checkLimits, clientIp, tooManyRequests } from "@/lib/rate-limit";

/** Adds an email to the newsletter. Subscribing again, or after unsubscribing, is safe. */
export async function POST(request: Request) {
  const limit = await checkLimits([{ key: `newsletter:ip:${clientIp(request)}`, limit: 10, windowSeconds: 60 * 60 }]);
  if (!limit.allowed) return tooManyRequests(limit);

  const body = await request.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const now = new Date();
  const { subscribers } = await collections();
  const result = await subscribers.updateOne(
    { _id: parsed.data.email },
    {
      $set: { email: parsed.data.email, status: "subscribed", updatedAt: now },
      $setOnInsert: { source: "website", createdAt: now },
    },
    { upsert: true },
  );
  // Only new sign-ups are announced, not people who subscribe again.
  if (result.upsertedCount > 0) {
    await notify({
      type: "subscriber",
      title: "New newsletter subscriber",
      body: parsed.data.email,
      href: "/admin/subscribers",
      permission: "messages:read",
    });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
