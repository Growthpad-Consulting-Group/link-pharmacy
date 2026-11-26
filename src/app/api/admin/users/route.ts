import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { collections } from "@/lib/db/collections";
import { isDuplicateKeyError } from "@/lib/db/mongo";
import { toAdminView, type AdminDoc } from "@/lib/db/models";
import { hashPassword } from "@/lib/portal/password";
import { adminCreateSchema, issuesFrom } from "@/lib/portal/schemas";

/** Staff accounts, newest first. Doctors only. */
export async function GET() {
  const auth = await authorize("admins:manage");
  if ("response" in auth) return auth.response;

  const { admins } = await collections();
  const docs = await admins.find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ admins: docs.map(toAdminView) });
}

/** Creates a staff account with a starting password. Ask the new person to keep it private. */
export async function POST(request: Request) {
  const auth = await authorize("admins:manage");
  if ("response" in auth) return auth.response;
  const { admin } = auth;

  const body = await request.json().catch(() => null);
  const parsed = adminCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const now = new Date();
  const doc: AdminDoc = {
    _id: randomUUID(),
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash: await hashPassword(parsed.data.password),
    role: parsed.data.role,
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  const { admins } = await collections();
  try {
    await admins.insertOne(doc);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: "A staff account with this email already exists.", issues: { email: ["This email is already in use"] } },
        { status: 409 },
      );
    }
    throw error;
  }

  await recordAudit(admin.id, "admin.create", doc._id, `${doc.role}`);
  return NextResponse.json({ admin: toAdminView(doc) }, { status: 201 });
}
