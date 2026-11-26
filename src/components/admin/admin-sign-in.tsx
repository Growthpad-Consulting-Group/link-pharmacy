"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import { FieldError, inputClass, type FieldIssues } from "@/components/portal/form-ui";
import { Alert } from "./format";
import { Spinner } from "./loading";
import { ApiError, apiFetch, errorMessage } from "./api";

/** Staff sign-in. When no admin account exists yet, the same screen creates the first doctor account. */
export function AdminSignIn({ needsSetup }: { needsSetup: boolean }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<FieldIssues>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setIssues({});
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await apiFetch(needsSetup ? "/api/admin/setup" : "/api/admin/login", { body: data });
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      if (err instanceof ApiError) setIssues(err.issues);
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-sm border border-slate-200 bg-white p-8">
      <img src="/link-logo.svg" alt="Link Pharmacy" className="h-10 w-auto" />
      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">Staff admin</p>
      <h1 className="mt-1 text-2xl font-bold text-ink">{needsSetup ? "Create the first admin account" : "Staff sign in"}</h1>
      <p className="mt-2 text-sm text-muted">
        {needsSetup
          ? "No staff account exists yet. The first account is a doctor account, and you can add the rest of your team from there."
          : "Sign in with the email and password your clinic gave you."}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        {needsSetup && (
          <>
            <label className="block text-sm font-medium text-ink">
              Full name
              <input name="name" required autoComplete="name" aria-invalid={Boolean(issues.name)} className={inputClass} />
              <FieldError messages={issues.name} />
            </label>
          </>
        )}
        <label className="block text-sm font-medium text-ink">
          Email
          <input name="email" type="email" required autoComplete="email" aria-invalid={Boolean(issues.email)} className={inputClass} />
          <FieldError messages={issues.email} />
        </label>
        <label className="block text-sm font-medium text-ink">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete={needsSetup ? "new-password" : "current-password"}
            placeholder={needsSetup ? "At least 12 characters" : ""}
            aria-invalid={Boolean(issues.password)}
            className={inputClass}
          />
          <FieldError messages={issues.password} />
        </label>

        {error && <Alert tone="error">{error}</Alert>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-between gap-3 rounded-md bg-ink px-5 py-3 font-semibold text-white transition hover:bg-ink/85 disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner className="h-4 w-4 text-brand" /> Please wait…
            </span>
          ) : (
            <>
              {needsSetup ? "Create account" : "Sign in"}
              <Icon icon="lucide:arrow-right" className="h-4 w-4 text-brand" aria-hidden />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
