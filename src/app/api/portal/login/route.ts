import { NextResponse } from "next/server";
import { PATIENT_SESSION, startSession } from "@/lib/auth/sessions";
import { collections } from "@/lib/db/collections";
import { toPatientView } from "@/lib/db/models";
import { checkLimits, clientIp, tooManyRequests } from "@/lib/rate-limit";
import { verifyPassword } from "@/lib/portal/password";
import { issuesFrom, loginSchema } from "@/lib/portal/schemas";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  // Limit by address and by account, so guessing one password from many addresses is also blocked.
  const limit = await checkLimits([
    { key: `patient-login:ip:${clientIp(request)}`, limit: 30, windowSeconds: 15 * 60 },
    { key: `patient-login:email:${parsed.data.email}`, limit: 8, windowSeconds: 15 * 60 },
  ]);
  if (!limit.allowed) return tooManyRequests(limit);

  const { users } = await collections();
  const user = await users.findOne({ email: parsed.data.email });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  // The same message for an unknown email and a wrong password, so the form does not reveal which accounts exist.
  if (!user || !valid) {
    return NextResponse.json({ error: "Email or password is incorrect" }, { status: 401 });
  }

  const response = NextResponse.json({ patient: toPatientView(user) });
  await startSession(response, PATIENT_SESSION, user._id);
  return response;
}
