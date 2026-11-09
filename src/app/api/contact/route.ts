import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  topic: z.enum(["order", "prescription", "product", "clinic", "other"]),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const issues: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path.at(-1) ?? "form");
      (issues[key] ??= []).push(issue.message);
    }
    return NextResponse.json({ error: "Please check the highlighted fields", issues }, { status: 422 });
  }

  // TODO: forward to your helpdesk or email provider. Until one is connected, messages are only logged.
  console.info("[contact] new message from", parsed.data.email, "topic:", parsed.data.topic);

  return NextResponse.json({ ok: true });
}
