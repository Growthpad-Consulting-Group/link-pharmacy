import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSignIn } from "@/components/admin/admin-sign-in";
import { getCurrentAdmin } from "@/lib/admin/session";
import { collections } from "@/lib/db/collections";

export const metadata = {
  title: "Staff admin",
  robots: { index: false, follow: false },
};

// Staff screens are for signed-in staff only. Anyone else sees the sign-in form, and the API
// enforces the same checks on every request.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    const { admins } = await collections();
    const needsSetup = (await admins.estimatedDocumentCount()) === 0;
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12">
        <AdminSignIn needsSetup={needsSetup} />
      </div>
    );
  }

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
