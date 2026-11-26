import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin/session";
import { listNotifications } from "@/lib/notifications/service";

/** Recent notifications the signed-in admin can see, with the unread count. Live updates arrive over the WebSocket. */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  return NextResponse.json(await listNotifications(admin.id, admin.permissions));
}
