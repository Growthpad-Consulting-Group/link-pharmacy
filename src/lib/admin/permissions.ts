import { ADMIN_ROLES, type AdminRole } from "@/lib/db/models";

// Safe to import from client components. The API enforces these rules; the screens only hide what a role cannot do.

export const PERMISSIONS = [
  "patients:read",
  "prescriptions:read",
  "prescriptions:file",
  "prescriptions:review",
  "prescriptions:dispense",
  "admins:manage",
  "content:manage",
  "messages:read",
  "messages:manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_LABELS: Record<AdminRole, string> = {
  doctor: "Doctor",
  pharmacist: "Pharmacist",
  staff: "Staff",
};

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  doctor: "Reviews prescriptions, manages content and the inbox, and manages staff accounts.",
  pharmacist: "Reviews and opens prescriptions, marks medicines as dispensed, and views the inbox and orders.",
  staff: "Looks up patients, manages blog articles and branches, and works through the inbox.",
};

const ROLE_PERMISSIONS: Record<AdminRole, readonly Permission[]> = {
  doctor: [
    "patients:read",
    "prescriptions:read",
    "prescriptions:file",
    "prescriptions:review",
    "admins:manage",
    "content:manage",
    "messages:read",
    "messages:manage",
  ],
  pharmacist: [
    "patients:read",
    "prescriptions:read",
    "prescriptions:file",
    "prescriptions:review",
    "prescriptions:dispense",
    "messages:read",
  ],
  staff: ["patients:read", "prescriptions:read", "content:manage", "messages:read", "messages:manage"],
};

export function permissionsFor(role: AdminRole): Permission[] {
  return [...ROLE_PERMISSIONS[role]];
}

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function isAdminRole(value: unknown): value is AdminRole {
  return (ADMIN_ROLES as readonly unknown[]).includes(value);
}
