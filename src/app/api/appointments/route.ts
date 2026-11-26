import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { collections } from "@/lib/db/collections";
import { notify } from "@/lib/notifications/service";
import { issuesFrom } from "@/lib/portal/schemas";
import { checkLimits, clientIp, tooManyRequests } from "@/lib/rate-limit";

const appointmentSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120, "Use 120 characters or fewer"),
  email: z.email("Enter a valid email address").max(200, "Use 200 characters or fewer"),
  phone: z.string().trim().min(6, "Enter a phone number we can call you on").max(40, "Use 40 characters or fewer"),
  message: z
    .string()
    .trim()
    .min(10, "Please describe what you need (at least 10 characters)")
    .max(1000, "Please keep your message under 1,000 characters"),
});

export async function POST(request: Request) {
  const limit = await checkLimits([{ key: `appointment:ip:${clientIp(request)}`, limit: 10, windowSeconds: 60 * 60 }]);
  if (!limit.allowed) return tooManyRequests(limit);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const now = new Date();
  const reference = `APT-${randomUUID().slice(0, 8).toUpperCase()}`;
  const { appointments } = await collections();
  await appointments.insertOne({
    _id: randomUUID(),
    reference,
    ...parsed.data,
    email: parsed.data.email.toLowerCase(),
    status: "new",
    createdAt: now,
    updatedAt: now,
  });
  await notify({
    type: "appointment",
    title: `New appointment request ${reference} from ${parsed.data.name}`,
    body: parsed.data.message,
    href: "/admin/appointments",
    permission: "messages:read",
  });

  return NextResponse.json({ reference });
}
