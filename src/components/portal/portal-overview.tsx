"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { usePatient } from "./portal-context";
import { MyPrescriptions } from "./my-prescriptions";

// Fields a patient should complete before their first visit.
const PROFILE_FIELDS = ["dateOfBirth", "address", "medicalAid", "allergies", "emergencyContact"] as const;

const ACTIONS = [
  { href: "/patient-portal/upload", title: "Upload a prescription", text: "Send a photo or PDF to the pharmacy.", icon: "lucide:upload" },
  { href: "/patient-portal/prescriptions", title: "Track prescriptions", text: "See where each prescription is.", icon: "lucide:file-text" },
  { href: "/patient-portal/details", title: "Update my details", text: "Keep contact and medical information current.", icon: "lucide:user-round" },
];

export function PortalOverview() {
  const patient = usePatient();
  const completed = PROFILE_FIELDS.filter((field) => patient[field].trim() !== "").length;
  const percent = Math.round((completed / PROFILE_FIELDS.length) * 100);
  const firstName = patient.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-muted">Welcome back</p>
        <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">Hello, {firstName}</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-ink/30 hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/25">
              <Icon icon={action.icon} className="h-5 w-5 text-ink" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-ink">{action.title}</p>
              <p className="mt-1 text-sm text-muted">{action.text}</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-ink">
              Open
              <Icon icon="lucide:arrow-right" className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-ink">Recent prescriptions</h2>
            <Link href="/patient-portal/prescriptions" className="text-sm font-semibold text-ink hover:underline">
              View all
            </Link>
          </div>
          <div className="px-6">
            <MyPrescriptions limit={3} />
          </div>
        </section>

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-ink">Profile</h2>
          <p className="mt-1 text-sm text-muted">{completed} of {PROFILE_FIELDS.length} details added</p>
          <div
            role="progressbar"
            aria-label="Profile completeness"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
          >
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-4 text-sm text-ink/80">
            {percent === 100
              ? "Your profile is complete."
              : "Adding your medical aid, allergies and emergency contact helps the pharmacy look after you."}
          </p>
          {percent < 100 && (
            <Link href="/patient-portal/details" className="mt-4 inline-block text-sm font-semibold text-ink hover:underline">
              Complete my profile
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
