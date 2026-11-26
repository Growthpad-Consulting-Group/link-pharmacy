"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import { FieldError, FormAlert, inputClass, type FieldIssues } from "./form-ui";

type Mode = "signin" | "register";

const HIGHLIGHTS = [
  { icon: "lucide:upload", text: "Send prescriptions to the pharmacy in a few clicks." },
  { icon: "lucide:file-check", text: "Follow each prescription from received to ready." },
  { icon: "lucide:lock", text: "Your health information stays private." },
];

/** Sign-in and account creation for the patient portal. Shown instead of the portal when nobody is signed in. */
export function PortalAuth() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
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
      const res = await fetch(mode === "signin" ? "/api/portal/login" : "/api/portal/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Something went wrong");
        setIssues(body.issues ?? {});
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isRegister = mode === "register";

  return (
    <div className="grid min-h-screen w-full bg-slate-100 text-ink lg:grid-cols-[1fr_480px]">
      <section className="relative flex flex-col justify-between overflow-hidden bg-ink p-8 text-white md:p-12">
        <div className="flex items-center gap-3">
          <span className="flex h-10 items-center rounded-md bg-white px-2.5">
            <img src="/link-logo.svg" alt="Link Pharmacy" className="h-7 w-auto" />
          </span>
          <span className="text-sm font-semibold tracking-wide text-white/90">Patient portal</span>
        </div>

        <div className="my-auto max-w-md space-y-8 py-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Your prescriptions, in one place.</h1>
            <p className="mt-4 text-white/75">Sign in to send prescriptions to your pharmacy and check where each one is.</p>
          </div>
          <ul className="space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-white/85">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <Icon icon={item.icon} className="h-4 w-4 text-brand" aria-hidden />
                </span>
                <span className="pt-1 text-sm">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

      </section>

      <section className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-ink">{isRegister ? "Create your account" : "Sign in to your portal"}</h2>
          <p className="mt-1 text-sm text-muted">
            {isRegister ? "It takes less than a minute." : "Use the email and password you registered with."}
          </p>

          <div role="tablist" aria-label="Account" className="mt-6 grid grid-cols-2 rounded-lg bg-slate-200/70 p-1">
            {(["signin", "register"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => {
                  setMode(value);
                  setError(null);
                  setIssues({});
                }}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                  mode === value ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                {value === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form key={mode} onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            {isRegister && (
              <label className="block text-sm font-medium text-ink">
                Full name
                <input name="name" autoComplete="name" required aria-invalid={Boolean(issues.name)} className={inputClass} />
                <FieldError messages={issues.name} />
              </label>
            )}

            <label className="block text-sm font-medium text-ink">
              Email
              <input name="email" type="email" autoComplete="email" required aria-invalid={Boolean(issues.email)} className={inputClass} />
              <FieldError messages={issues.email} />
            </label>

            {isRegister && (
              <label className="block text-sm font-medium text-ink">
                Phone number
                <input name="phone" type="tel" autoComplete="tel" required aria-invalid={Boolean(issues.phone)} className={inputClass} />
                <FieldError messages={issues.phone} />
              </label>
            )}

            <label className="block text-sm font-medium text-ink">
              Password
              <input
                name="password"
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
                placeholder={isRegister ? "At least 8 characters" : ""}
                aria-invalid={Boolean(issues.password)}
                className={inputClass}
              />
              <FieldError messages={issues.password} />
            </label>

            <FormAlert message={error} />

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 font-semibold text-white transition hover:bg-ink/85 disabled:cursor-wait disabled:opacity-70"
            >
              {submitting ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
            </button>
          </form>

          <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
            <Icon icon="lucide:arrow-left" className="h-4 w-4" aria-hidden />
            Back to Link Pharmacy
          </Link>
        </div>
      </section>
    </div>
  );
}
