import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { ADMIN_SESSION, startSession } from "@/lib/auth/sessions";
import { collections } from "@/lib/db/collections";
import { isDuplicateKeyError } from "@/lib/db/mongo";
import { toAdminView, type AdminDoc } from "@/lib/db/models";
import { hashPassword } from "@/lib/portal/password";
import { adminSetupSchema, issuesFrom } from "@/lib/portal/schemas";
import { checkLimits, clientIp, tooManyRequests } from "@/lib/rate-limit";

// Creates the first admin account, always with the doctor role. It works only while no admin exists.
// Anyone who reaches this before the clinic does could claim it, so create the first account right after deploying.
export async function POST(request: Request) {
  const limit = await checkLimits([{ key: `admin-setup:ip:${clientIp(request)}`, limit: 5, windowSeconds: 60 * 60 }]);
  if (!limit.allowed) return tooManyRequests(limit);

  const body = await request.json().catch(() => null);
  const parsed = adminSetupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const { admins } = await collections();
  if ((await admins.estimatedDocumentCount()) > 0) {
    return NextResponse.json({ error: "An admin account already exists. Sign in instead." }, { status: 409 });
  }

  const now = new Date();
  const doc: AdminDoc = {
    _id: randomUUID(),
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash: await hashPassword(parsed.data.password),
    role: "doctor",
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  try {
    await admins.insertOne(doc);
  } catch (error) {
    if (isDuplicateKeyError(error)) return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
    throw error;
  }

  const response = NextResponse.json({ admin: toAdminView(doc) }, { status: 201 });
  await startSession(response, ADMIN_SESSION, doc._id);
  return response;
}
