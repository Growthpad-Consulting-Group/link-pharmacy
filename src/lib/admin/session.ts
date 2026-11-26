import "server-only";
import { NextResponse } from "next/server";
import { ADMIN_SESSION, currentSubjectId } from "@/lib/auth/sessions";
import { collections } from "@/lib/db/collections";
import type { AdminView } from "@/lib/db/models";
import { permissionsFor, type Permission } from "./permissions";

export type CurrentAdmin = AdminView & { permissions: Permission[] };

/** The signed-in, active admin with their permissions, or null. Deactivated accounts are signed out. */
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const id = await currentSubjectId(ADMIN_SESSION);
  if (!id) return null;
  const { admins } = await collections();
  const doc = await admins.findOne({ _id: id }, { projection: { passwordHash: 0 } });
  if (!doc || !doc.active) return null;
  return {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    active: doc.active,
    avatarUrl: doc.avatarUrl ?? null,
    createdAt: doc.createdAt.toISOString(),
    permissions: permissionsFor(doc.role),
  };
}

/**
 * Use at the top of every admin route. Returns the admin when they hold the permission,
 * otherwise a 401 (not signed in) or 403 (signed in, role not allowed) response to return directly.
 */
export async function authorize(
  permission: Permission,
): Promise<{ admin: CurrentAdmin } | { response: NextResponse }> {
  const admin = await getCurrentAdmin();
  if (!admin) return { response: NextResponse.json({ error: "Please sign in" }, { status: 401 }) };
  if (!admin.permissions.includes(permission)) {
    return { response: NextResponse.json({ error: "Your role does not allow this action" }, { status: 403 }) };
  }
  return { admin };
}
