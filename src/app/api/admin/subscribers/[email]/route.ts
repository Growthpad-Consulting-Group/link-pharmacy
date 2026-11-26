import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { collections } from "@/lib/db/collections";
import { subscriberStatusSchema } from "@/lib/content/schemas";
import { issuesFrom } from "@/lib/portal/schemas";

/** Unsubscribes or resubscribes an email address. Subscribers are never deleted, so opt-outs are kept. */
export async function PATCH(request: Request, { params }: { params: Promise<{ email: string }> }) {
  const auth = await authorize("messages:manage");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = subscriberStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const { email: rawEmail } = await params;
  const email = decodeURIComponent(rawEmail).toLowerCase();
  const { subscribers } = await collections();
  const result = await subscribers.updateOne(
    { _id: email },
    { $set: { status: parsed.data.status, updatedAt: new Date() } },
  );
  if (result.matchedCount === 0) return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });

  await recordAudit(auth.admin.id, "subscriber.status", email, parsed.data.status);
  return NextResponse.json({ email, status: parsed.data.status });
}
