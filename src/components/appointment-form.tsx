"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";

type Errors = Partial<Record<"name" | "email" | "phone" | "message", string[]>>;

const inputClass =
  "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-ink outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/40 aria-[invalid=true]:border-rose-400";

export function AppointmentForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [reference, setReference] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setErrors({});

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(["name", "email", "phone", "message"].map((k) => [k, String(form.get(k) ?? "")]));

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        if (data.issues) setErrors(data.issues as Errors);
        return;
      }
      setReference(data.reference);
      formElement.reset();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-sm bg-white p-10 text-center text-ink">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/20">
          <Icon icon="lucide:check" className="h-7 w-7 text-ink" aria-hidden />
        </span>
        <h3 className="text-xl font-bold">Thank you, your request is in</h3>
        <p className="text-ink/80">
          Your reference is <span className="font-semibold">{reference}</span>. Our team will call you to confirm your appointment.
        </p>
        <button type="button" onClick={() => setReference(null)} className="font-semibold hover:underline">
          Make another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-sm bg-white p-6 text-ink sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Full name
          <input name="name" autoComplete="name" required aria-invalid={Boolean(errors.name)} className={inputClass} />
          {errors.name?.[0] && <span className="mt-1.5 block text-xs text-rose-600">{errors.name[0]}</span>}
        </label>
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} className={inputClass} />
          {errors.email?.[0] && <span className="mt-1.5 block text-xs text-rose-600">{errors.email[0]}</span>}
        </label>
        <label className="block text-sm font-medium sm:col-span-2">
          Phone number
          <input name="phone" type="tel" autoComplete="tel" required aria-invalid={Boolean(errors.phone)} className={inputClass} />
          {errors.phone?.[0] && <span className="mt-1.5 block text-xs text-rose-600">{errors.phone[0]}</span>}
        </label>
      </div>

      <label className="block text-sm font-medium">
        Message
        <textarea
          name="message"
          rows={4}
          required
          aria-invalid={Boolean(errors.message)}
          placeholder="Tell us what you need, for example a fever since yesterday or a blood pressure check"
          className={`${inputClass} resize-y`}
        />
        {errors.message?.[0] && <span className="mt-1.5 block text-xs text-rose-600">{errors.message[0]}</span>}
      </label>

      {error && (
        <p role="alert" className="flex items-start gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <Icon icon="lucide:circle-alert" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-between gap-3 rounded-md bg-brand px-5 py-3.5 font-semibold text-ink transition hover:bg-brand-hover disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:min-w-64"
      >
        <span className="flex items-center gap-2">
          <Icon icon="lucide:calendar-check" className="h-4 w-4" aria-hidden />
          {submitting ? "Sending…" : "Request appointment"}
        </span>
        <Icon icon="lucide:arrow-right" className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
