"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Permission } from "@/lib/admin/permissions";
import type { AdminView } from "@/lib/db/models";

export type AdminSession = AdminView & { permissions: Permission[] };

const AdminContext = createContext<AdminSession | null>(null);

export function AdminProvider({ admin, children }: { admin: AdminSession; children: ReactNode }) {
  return <AdminContext.Provider value={admin}>{children}</AdminContext.Provider>;
}

/** The signed-in admin. Only valid inside the admin shell. */
export function useAdmin(): AdminSession {
  const admin = useContext(AdminContext);
  if (!admin) throw new Error("useAdmin must be used inside the admin shell");
  return admin;
}

/** Hides controls the role cannot use. The API enforces the same rules on every request. */
export function can(admin: AdminSession, permission: Permission): boolean {
  return admin.permissions.includes(permission);
}
