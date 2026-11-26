"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";

export function NewsletterForm() {
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Show the first field problem (for example, the consent box), not just the generic message.
        const firstIssue = Object.values(body.issues ?? {}).flat()[0];
        setStatus({ tone: "error", text: typeof firstIssue === "string" ? firstIssue : (body.error ?? "We could not subscribe you. Please try again.") });
        return;
      }
      form.reset();
      setStatus({ tone: "ok", text: "Thanks for subscribing. Look out for Link savings in your inbox." });
    } catch {
      setStatus({ tone: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="newsletter-email" className="text-sm font-semibold text-white">
        Email address
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email address"
          required
          className="min-w-0 flex-1 rounded-md bg-white px-4 py-3 text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex shrink-0 items-center gap-3 rounded-md bg-brand px-5 py-3 font-semibold text-ink transition hover:bg-brand-hover disabled:cursor-wait disabled:opacity-70"
        >
          Subscribe
          <span aria-hidden className="h-5 w-px bg-ink/30" />
          <Icon icon="lucide:arrow-right" className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <label className="mt-4 flex items-start gap-3 text-sm text-white/85">
        <input type="checkbox" name="consent" value="true" required className="mt-0.5 h-4 w-4 shrink-0 accent-brand" />
        I would like to receive Link savings and deals by email.
      </label>
      {/* TODO: replace placeholder href with the real privacy policy URL. */}
      <a href="#" className="mt-2 inline-block pl-7 text-sm text-white underline hover:text-brand">
        Privacy Policy
      </a>
      {status && (
        <p role="status" className={`mt-4 text-sm ${status.tone === "ok" ? "text-brand" : "text-rose-200"}`}>
          {status.text}
        </p>
      )}
    </form>
  );
}
