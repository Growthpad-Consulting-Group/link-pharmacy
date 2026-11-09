"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";

type Errors = Partial<Record<"name" | "email" | "phone" | "prescription" | "consent", string[]>>;

const inputClass =
  "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-ink outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/40 aria-[invalid=true]:border-rose-400";

export function PrescriptionForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [fileName, setFileName] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setErrors({});

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const res = await fetch("/api/prescriptions", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        if (data.issues) setErrors(data.issues as Errors);
        return;
      }
      setReference(data.reference);
      formElement.reset();
      setFileName(null);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-sm border border-slate-200 bg-white p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/20">
          <Icon icon="lucide:check" className="h-7 w-7 text-ink" aria-hidden />
        </span>
        <h2 className="text-xl font-bold text-ink">Prescription received</h2>
        <p className="text-muted">
          Your reference is <span className="font-semibold text-ink">{reference}</span>. A pharmacist will check it and
          contact you before anything is dispensed.
        </p>
        <button type="button" onClick={() => setReference(null)} className="font-semibold text-ink hover:underline">
          Upload another prescription
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 rounded-sm border border-slate-200 bg-white p-6 sm:p-8">
      <div>
        <h2 className="text-xl font-bold text-ink">Upload your prescription</h2>
        <p className="mt-1 text-sm text-muted">JPG, PNG or PDF, up to 10 MB. Make sure every line is readable.</p>
      </div>

      <label
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-sm border-2 border-dashed p-8 text-center transition hover:border-brand ${errors.prescription ? "border-rose-400" : "border-slate-300 bg-[#F7F9F6]"}`}
      >
        <Icon icon="lucide:upload" className="h-8 w-8 text-ink" aria-hidden />
        <span className="font-semibold text-ink">{fileName ?? "Choose a file or drop it here"}</span>
        <span className="text-xs text-muted">JPG, PNG or PDF, max 10 MB</span>
        <input
          type="file"
          name="prescription"
          accept="image/jpeg,image/png,application/pdf"
          required
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </label>
      {errors.prescription?.[0] && <p className="-mt-3 text-xs text-rose-600">{errors.prescription[0]}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">
          Full name
          <input name="name" autoComplete="name" required aria-invalid={Boolean(errors.name)} className={inputClass} />
          {errors.name?.[0] && <span className="mt-1.5 block text-xs text-rose-600">{errors.name[0]}</span>}
        </label>
        <label className="block text-sm font-medium text-ink">
          Phone
          <input name="phone" type="tel" autoComplete="tel" required aria-invalid={Boolean(errors.phone)} className={inputClass} />
          {errors.phone?.[0] && <span className="mt-1.5 block text-xs text-rose-600">{errors.phone[0]}</span>}
        </label>
        <label className="block text-sm font-medium text-ink sm:col-span-2">
          Email
          <input name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} className={inputClass} />
          {errors.email?.[0] && <span className="mt-1.5 block text-xs text-rose-600">{errors.email[0]}</span>}
        </label>
      </div>

      <label className="block text-sm font-medium text-ink">
        Notes for the pharmacist <span className="font-normal text-muted">(optional)</span>
        <textarea name="notes" rows={3} placeholder="For example: refill of my usual medicine" className={`${inputClass} resize-y`} />
      </label>

      <label className={`flex items-start gap-3 text-sm text-ink ${errors.consent ? "text-rose-700" : ""}`}>
        <input name="consent" value="true" type="checkbox" required className="mt-1 h-4 w-4 accent-ink" />
        <span>
          I confirm this is a genuine prescription for me or someone I am allowed to act for, and I agree that the pharmacy
          may use it to dispense my medicine.
        </span>
      </label>
      {errors.consent?.[0] && <p className="-mt-3 text-xs text-rose-600">{errors.consent[0]}</p>}

      {error && (
        <p role="alert" className="flex items-start gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <Icon icon="lucide:circle-alert" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-between gap-3 rounded-md bg-ink px-5 py-3.5 font-semibold text-white transition hover:bg-ink/85 disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:min-w-64"
      >
        <span className="flex items-center gap-2">
          <Icon icon="lucide:file-check" className="h-4 w-4 text-brand" aria-hidden />
          {submitting ? "Uploading…" : "Submit prescription"}
        </span>
        <Icon icon="lucide:arrow-right" className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
