"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { AvatarUpload } from "@/components/avatar-upload";
import { FieldError, FormAlert, FormSuccess, inputClass, type FieldIssues } from "./form-ui";
import { usePatient } from "./portal-context";

export function MyDetails() {
  const patient = usePatient();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<FieldIssues>({});
  const [saved, setSaved] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setIssues({});
    setSaved(null);

    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const res = await fetch("/api/portal/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Something went wrong");
        setIssues(body.issues ?? {});
        return;
      }
      setSaved("Your details have been saved.");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <AvatarUpload src={patient.avatarUrl} name={patient.name} endpoint="/api/portal/avatar" />
      </section>

    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">My details</h1>
          <p className="mt-1 text-sm text-muted">These details are sent with your prescriptions so the pharmacy can reach you.</p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/85 disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </header>

      <FormSuccess message={saved} />
      <FormAlert message={error} />

      <Section title="Personal" description="Your name and date of birth as they appear on your ID.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" issues={issues.name}>
            <input name="name" defaultValue={patient.name} autoComplete="name" required aria-invalid={Boolean(issues.name)} className={inputClass} />
          </Field>
          <Field label="Date of birth" issues={issues.dateOfBirth}>
            <input name="dateOfBirth" type="date" defaultValue={patient.dateOfBirth} aria-invalid={Boolean(issues.dateOfBirth)} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="Contact" description="We use these to reach you about your prescriptions.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone number" issues={issues.phone}>
            <input name="phone" type="tel" defaultValue={patient.phone} autoComplete="tel" required aria-invalid={Boolean(issues.phone)} className={inputClass} />
          </Field>
          <Field label="Email" hint="Your login. Contact the pharmacy to change it.">
            <input value={patient.email} readOnly className={`${inputClass} bg-slate-50 text-muted`} />
          </Field>
          <Field label="Delivery or home address" issues={issues.address} className="sm:col-span-2">
            <textarea name="address" rows={2} defaultValue={patient.address} className={`${inputClass} resize-y`} />
          </Field>
        </div>
      </Section>

      <Section title="Medical" description="Helps the pharmacist check your prescriptions safely.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Medical aid or insurer" hint="Optional" issues={issues.medicalAid}>
            <input name="medicalAid" defaultValue={patient.medicalAid} className={inputClass} />
          </Field>
          <Field label="Emergency contact" hint="Name and phone number" issues={issues.emergencyContact}>
            <input name="emergencyContact" defaultValue={patient.emergencyContact} className={inputClass} />
          </Field>
          <Field label="Allergies and medical conditions" hint="Optional. For example: penicillin allergy, asthma" issues={issues.allergies} className="sm:col-span-2">
            <textarea name="allergies" rows={3} defaultValue={patient.allergies} className={`${inputClass} resize-y`} />
          </Field>
        </div>
      </Section>

      <p className="flex items-center gap-2 text-xs text-muted">
        <Icon icon="lucide:lock" className="h-3.5 w-3.5" aria-hidden />
        Your health information is private and only visible to pharmacy staff.
      </p>
    </form>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-ink">{title}</h2>
      <p className="mb-5 mt-1 text-sm text-muted">{description}</p>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  issues,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  issues?: string[];
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block text-sm font-medium text-ink ${className}`}>
      {label}
      {hint && <span className="ml-1 font-normal text-muted">({hint})</span>}
      {children}
      <FieldError messages={issues} />
    </label>
  );
}
