import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { collections } from "@/lib/db/collections";
import { notify } from "@/lib/notifications/service";
import { issuesFrom } from "@/lib/portal/schemas";
import { checkLimits, clientIp, tooManyRequests } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120, "Use 120 characters or fewer"),
  email: z.email("Enter a valid email address").max(200, "Use 200 characters or fewer"),
  topic: z.enum(["order", "prescription", "product", "clinic", "other"], { error: "Choose what your message is about" }),
  message: z
    .string()
    .trim()
    .min(10, "Please write a little more (at least 10 characters) so we can help")
    .max(2000, "Please keep your message under 2,000 characters"),
});

export async function POST(request: Request) {
  const limit = await checkLimits([{ key: `contact:ip:${clientIp(request)}`, limit: 10, windowSeconds: 60 * 60 }]);
  if (!limit.allowed) return tooManyRequests(limit);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const now = new Date();
  const { contactMessages } = await collections();
  await contactMessages.insertOne({
    _id: randomUUID(),
    ...parsed.data,
    email: parsed.data.email.toLowerCase(),
    status: "new",
    createdAt: now,
    updatedAt: now,
  });
  await notify({
    type: "message",
    title: `New ${parsed.data.topic} message from ${parsed.data.name}`,
    body: parsed.data.message,
    href: "/admin/messages",
    permission: "messages:read",
  });

  return NextResponse.json({ ok: true });
}
