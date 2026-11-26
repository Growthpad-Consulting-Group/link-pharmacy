import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/admin/session";
import { markNotificationsRead } from "@/lib/notifications/service";

const bodySchema = z.object({
  // Omit `ids` to mark everything visible as read.
  ids: z.array(z.string().regex(/^[a-f0-9]{24}$/, "Invalid notification id")).max(200).optional(),
});

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 422 });

  const ids = parsed.data.ids ? parsed.data.ids.map((id) => new ObjectId(id)) : null;
  await markNotificationsRead(admin.id, admin.permissions, ids);
  return NextResponse.json({ ok: true });
}
