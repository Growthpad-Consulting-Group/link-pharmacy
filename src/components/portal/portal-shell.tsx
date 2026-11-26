"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import type { PatientView } from "@/lib/db/models";
import { Avatar } from "@/components/avatar-upload";
import { PatientProvider } from "./portal-context";

const NAV = [
  { href: "/patient-portal", label: "Overview", icon: "lucide:layout-dashboard" },
  { href: "/patient-portal/upload", label: "Upload prescription", icon: "lucide:upload" },
  { href: "/patient-portal/prescriptions", label: "My prescriptions", icon: "lucide:file-text" },
  { href: "/patient-portal/details", label: "My details", icon: "lucide:user-round" },
];

/** Application frame for the patient portal: navigation on the side (or top on phones), the patient's page in the main area. */
export function PortalShell({ patient, children }: { patient: PatientView; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/portal/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <PatientProvider patient={patient}>
      <div className="flex min-h-screen w-full flex-col bg-slate-100 text-ink md:flex-row">
        <aside className="bg-ink text-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col">
          <div className="flex items-center justify-between gap-4 px-5 pb-3 pt-5 md:pb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 items-center rounded-md bg-white px-2">
                <img src="/link-logo.svg" alt="Link Pharmacy" className="h-6 w-auto" />
              </span>
              <span className="text-sm font-semibold tracking-wide text-white/90">Patient portal</span>
            </div>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="inline-flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-60 md:hidden"
            >
              <Icon icon="lucide:log-out" className="h-4 w-4" aria-hidden />
              <span className="sr-only sm:not-sr-only">{signingOut ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>

          <nav aria-label="Patient portal" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0">
            {NAV.map((item) => {
              const active = item.href === "/patient-portal" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-3 rounded-md border-l-[3px] px-3 py-2.5 text-sm font-medium transition ${
                    active ? "border-brand bg-white/10 text-white" : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon icon={item.icon} className={`h-4 w-4 ${active ? "text-brand" : ""}`} aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto hidden space-y-4 border-t border-white/10 p-5 md:block">
            <div className="flex items-center gap-3">
              <Avatar src={patient.avatarUrl} name={patient.name} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{patient.name}</p>
                <p className="truncate text-xs text-white/60">{patient.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="inline-flex w-full items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              <Icon icon="lucide:log-out" className="h-4 w-4" aria-hidden />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
          <div className="mx-auto w-full max-w-4xl">{children}</div>
        </main>
      </div>
    </PatientProvider>
  );
}
