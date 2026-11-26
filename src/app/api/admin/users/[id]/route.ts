import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { collections } from "@/lib/db/collections";
import { toAdminView } from "@/lib/db/models";
import { hashPassword } from "@/lib/portal/password";
import { adminUpdateSchema, issuesFrom } from "@/lib/portal/schemas";

type Params = { params: Promise<{ id: string }> };

/**
 * Changes a staff account's role, active flag or password. Doctors only.
 * Guards: you cannot demote or deactivate yourself, and the last active doctor cannot be removed.
 * Any change that could let an old session keep working (role, deactivation, password) signs the account out.
 */
export async function PATCH(request: Request, { params }: Params) {
  const auth = await authorize("admins:manage");
  if ("response" in auth) return auth.response;
  const { admin: actor } = auth;

  const body = await request.json().catch(() => null);
  const parsed = adminUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const { id } = await params;
  const { admins, sessions } = await collections();
  const target = await admins.findOne({ _id: id });
  if (!target) return NextResponse.json({ error: "Staff account not found" }, { status: 404 });

  const { role, active, password } = parsed.data;
  const losesDoctor = target.role === "doctor" && target.active && ((role !== undefined && role !== "doctor") || active === false);

  if (id === actor.id && ((role !== undefined && role !== target.role) || active === false)) {
    return NextResponse.json({ error: "You cannot change your own role or deactivate your own account" }, { status: 409 });
  }
  if (losesDoctor) {
    const otherDoctors = await admins.countDocuments({ _id: { $ne: id }, role: "doctor", active: true });
    if (otherDoctors === 0) {
      return NextResponse.json({ error: "At least one active doctor must remain" }, { status: 409 });
    }
  }

  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (role !== undefined) set.role = role;
  if (active !== undefined) set.active = active;
  if (password !== undefined) set.passwordHash = await hashPassword(password);
  await admins.updateOne({ _id: id }, { $set: set });

  const revoke = role !== undefined || active === false || password !== undefined;
  if (revoke) {
    await sessions.deleteMany({ kind: "admin", subjectId: id });
  }

  const updated = await admins.findOne({ _id: id }, { projection: { passwordHash: 0 } });
  const changes = Object.keys(parsed.data).join(",");
  await recordAudit(actor.id, "admin.update", id, changes);
  return NextResponse.json({ admin: updated ? toAdminView(updated) : null });
}
