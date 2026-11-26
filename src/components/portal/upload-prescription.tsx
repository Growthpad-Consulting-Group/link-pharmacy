"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import { FieldError, FormAlert, inputClass, type FieldIssues } from "./form-ui";
import { usePatient } from "./portal-context";

export function UploadPrescription() {
  const patient = usePatient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<FieldIssues>({});
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setIssues({});

    const formElement = event.currentTarget;
    try {
      const res = await fetch("/api/portal/prescriptions", { method: "POST", body: new FormData(formElement) });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Something went wrong");
        setIssues(body.issues ?? {});
        return;
      }
      setUploaded(body.prescription.reference);
      formElement.reset();
      setFileName(null);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (uploaded) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/25">
          <Icon icon="lucide:check" className="h-7 w-7 text-ink" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-ink">Prescription received</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Your reference is <span className="font-semibold text-ink">{uploaded}</span>. A pharmacist will check it and
          contact you before anything is dispensed.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/patient-portal/prescriptions" className="rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink/85">
            Track my prescriptions
          </Link>
          <button
            type="button"
            onClick={() => setUploaded(null)}
            className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50"
          >
            Upload another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <form onSubmit={handleSubmit} noValidate className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Upload a prescription</h1>
          <p className="mt-1 text-sm text-muted">JPG, PNG or PDF, up to 10 MB. Make sure every line is readable.</p>
        </div>

        <label
          className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition hover:border-ink/40 hover:bg-slate-50 ${
            issues.prescription ? "border-rose-400 bg-rose-50/40" : "border-slate-300 bg-slate-50"
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <Icon icon="lucide:upload" className="h-5 w-5 text-ink" aria-hidden />
          </span>
          <span className="font-semibold text-ink">{fileName ?? "Choose a file to upload"}</span>
          <span className="text-xs text-muted">{fileName ? "Choose another file to replace it" : "JPG, PNG or PDF, max 10 MB"}</span>
          <input
            type="file"
            name="prescription"
            accept="image/jpeg,image/png,application/pdf"
            required
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
        <FieldError messages={issues.prescription} />

        <label className="block text-sm font-medium text-ink">
          Note for the pharmacist <span className="font-normal text-muted">(optional)</span>
          <textarea name="notes" rows={3} placeholder="For example: refill of my usual medicine" className={`${inputClass} resize-y`} />
          <FieldError messages={issues.notes} />
        </label>

        <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm text-ink">
          <input name="consent" value="true" type="checkbox" required className="mt-1 h-4 w-4 accent-ink" />
          <span>
            I confirm this is a genuine prescription for me, or for someone I am allowed to act for, and I agree that the
            pharmacy may use it to dispense my medicine.
          </span>
        </label>
        <FieldError messages={issues.consent} />

        <FormAlert message={error} />

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-6 py-3 font-semibold text-white transition hover:bg-ink/85 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        >
          {submitting ? "Uploading…" : "Submit prescription"}
        </button>
      </form>

      <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="font-semibold text-ink">Sent with your details</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div>
              <dt className="sr-only">Name</dt>
              <dd className="font-medium text-ink">{patient.name}</dd>
            </div>
            <div>
              <dt className="sr-only">Phone</dt>
              <dd className="text-muted">{patient.phone}</dd>
            </div>
          </dl>
          <Link href="/patient-portal/details" className="mt-3 inline-block text-sm font-semibold text-ink hover:underline">
            Update my details
          </Link>
        </div>
        <div className="border-t border-slate-100 pt-4">
          <h2 className="font-semibold text-ink">What happens next</h2>
          <ol className="mt-3 space-y-3 text-sm text-ink/80">
            <li className="flex gap-3">
              <span className="font-bold text-ink">1.</span> A pharmacist checks the prescription.
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-ink">2.</span> We contact you if anything is unclear.
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-ink">3.</span> You collect your medicine, or we arrange delivery.
            </li>
          </ol>
        </div>
      </aside>
    </div>
  );
}
