import type { ReactNode } from "react";
import { PortalAuth } from "@/components/portal/portal-auth";
import { PortalShell } from "@/components/portal/portal-shell";
import { getCurrentPatient } from "@/lib/portal/session";

// The portal is a separate application from the storefront: its own shell and navigation, no shop header or footer.
// Patient pages are private, so they are kept out of search results.
export const metadata = {
  title: { default: "Patient portal", template: "%s · Patient portal" },
  robots: { index: false, follow: false },
};

export default async function PatientPortalLayout({ children }: { children: ReactNode }) {
  const patient = await getCurrentPatient();
  if (!patient) return <PortalAuth />;
  return <PortalShell patient={patient}>{children}</PortalShell>;
}
