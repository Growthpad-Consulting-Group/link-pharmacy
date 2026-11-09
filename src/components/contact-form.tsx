"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";

type Errors = Partial<Record<"name" | "email" | "topic" | "message", string[]>>;

const inputClass =
  "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-ink outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/40 aria-[invalid=true]:border-rose-400";

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setErrors({});

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(["name", "email", "topic", "message"].map((k) => [k, String(form.get(k) ?? "")]));

    try {
      const res = await fetch("/api/contact", {
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
      setSent(true);
      event.currentTarget.reset();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-sm border border-slate-200 bg-white p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/20">
          <Icon icon="lucide:check" className="h-7 w-7 text-ink" aria-hidden />
        </span>
        <h2 className="text-xl font-bold text-ink">Thanks, we have your message</h2>
        <p className="text-muted">Our team will get back to you as soon as possible.</p>
        <button type="button" onClick={() => setSent(false)} className="font-semibold text-ink hover:underline">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-sm border border-slate-200 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-bold text-ink">Send us a message</h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">
          Full name
          <input name="name" autoComplete="name" required aria-invalid={Boolean(errors.name)} className={inputClass} />
          {errors.name?.[0] && <span className="mt-1.5 block text-xs text-rose-600">{errors.name[0]}</span>}
        </label>
        <label className="block text-sm font-medium text-ink">
          Email
          <input name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} className={inputClass} />
          {errors.email?.[0] && <span className="mt-1.5 block text-xs text-rose-600">{errors.email[0]}</span>}
        </label>
      </div>

      <label className="block text-sm font-medium text-ink">
        What is it about?
        <select name="topic" defaultValue="order" className={inputClass}>
          <option value="order">An order or delivery</option>
          <option value="prescription">A prescription</option>
          <option value="product">A product question</option>
          <option value="clinic">Link Mediclinic</option>
          <option value="other">Something else</option>
        </select>
      </label>

      <label className="block text-sm font-medium text-ink">
        Message
        <textarea
          name="message"
          rows={5}
          required
          aria-invalid={Boolean(errors.message)}
          placeholder="How can we help?"
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
        className="flex w-full items-center justify-between gap-3 rounded-md bg-ink px-5 py-3.5 font-semibold text-white transition hover:bg-ink/85 disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:min-w-56"
      >
        <span className="flex items-center gap-2">
          <Icon icon="lucide:send" className="h-4 w-4 text-brand" aria-hidden />
          {submitting ? "Sending…" : "Send message"}
        </span>
        <Icon icon="lucide:arrow-right" className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
