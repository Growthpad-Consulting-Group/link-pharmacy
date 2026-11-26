import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin/session";
import { collections } from "@/lib/db/collections";

/** The signed-in admin with their role and permissions. The admin screens call this on load. */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    // Tell the screens whether to show first-time setup, so it is only offered while no admin exists.
    const { admins } = await collections();
    const needsSetup = (await admins.estimatedDocumentCount()) === 0;
    return NextResponse.json({ error: "Please sign in", needsSetup }, { status: 401 });
  }
  return NextResponse.json({ admin });
}
