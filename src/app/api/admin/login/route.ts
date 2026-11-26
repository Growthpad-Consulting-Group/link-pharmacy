import { NextResponse } from "next/server";
import { ADMIN_SESSION, startSession } from "@/lib/auth/sessions";
import { collections } from "@/lib/db/collections";
import { toAdminView } from "@/lib/db/models";
import { verifyPassword } from "@/lib/portal/password";
import { adminLoginSchema, issuesFrom } from "@/lib/portal/schemas";
import { checkLimits, clientIp, tooManyRequests } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const limit = await checkLimits([
    { key: `admin-login:ip:${clientIp(request)}`, limit: 30, windowSeconds: 15 * 60 },
    { key: `admin-login:email:${parsed.data.email}`, limit: 5, windowSeconds: 15 * 60 },
  ]);
  if (!limit.allowed) return tooManyRequests(limit);

  const { admins } = await collections();
  const admin = await admins.findOne({ email: parsed.data.email });
  const valid = admin ? await verifyPassword(parsed.data.password, admin.passwordHash) : false;
  // Deactivated accounts get the same message as a wrong password, so the form reveals nothing extra.
  if (!admin || !valid || !admin.active) {
    return NextResponse.json({ error: "Email or password is incorrect" }, { status: 401 });
  }

  const response = NextResponse.json({ admin: toAdminView(admin) });
  await startSession(response, ADMIN_SESSION, admin._id);
  return response;
}
