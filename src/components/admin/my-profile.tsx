"use client";

import { AvatarUpload } from "@/components/avatar-upload";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/admin/permissions";
import { useAdmin } from "./admin-context";
import { Panel } from "./format";

/** The signed-in staff member's own profile: their photo and account details. */
export function MyProfile() {
  const admin = useAdmin();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">My profile</h1>
        <p className="text-sm text-muted">Your photo appears next to your name in the staff admin.</p>
      </div>

      <Panel title="Photo">
        <AvatarUpload src={admin.avatarUrl} name={admin.name} endpoint="/api/admin/profile/avatar" />
      </Panel>

      <Panel title="Account">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Name</dt>
            <dd className="font-semibold text-ink">{admin.name}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-semibold text-ink">{admin.email}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted">Role</dt>
            <dd className="font-semibold text-ink">{ROLE_LABELS[admin.role]}</dd>
            <dd className="text-muted">{ROLE_DESCRIPTIONS[admin.role]}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted">To change your name, email or role, ask a doctor.</p>
      </Panel>
    </div>
  );
}
