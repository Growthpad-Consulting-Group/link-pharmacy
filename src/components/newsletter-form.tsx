"use client";

import type { FormEvent } from "react";
import { Icon } from "@iconify/react";

export function NewsletterForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: send the email address to the newsletter service once one is connected.
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
          className="inline-flex shrink-0 items-center gap-3 rounded-md bg-brand px-5 py-3 font-semibold text-ink transition hover:bg-brand-hover"
        >
          Subscribe
          <span aria-hidden className="h-5 w-px bg-ink/30" />
          <Icon icon="lucide:arrow-right" className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <label className="mt-4 flex items-start gap-3 text-sm text-white/85">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-brand" />
        I would like to receive Link savings and deals by email.
      </label>
      {/* TODO: replace placeholder href with the real privacy policy URL. */}
      <a href="#" className="mt-2 inline-block pl-7 text-sm text-white underline hover:text-brand">
        Privacy Policy
      </a>
    </form>
  );
}
