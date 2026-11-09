"use client";

import { useSyncExternalStore } from "react";

type Choice = "accepted" | "rejected";
type Consent = Choice | "unset" | "pending";

const STORAGE_KEY = "link-pharmacy-cookie-consent";

/* ---------- tiny external store, same approach as the cart ---------- */

let cache: Consent | null = null;
const listeners = new Set<() => void>();

function readStorage(): Consent {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "accepted" || stored === "rejected" ? stored : "unset";
  } catch {
    return "unset"; // storage unavailable: ask again on the next visit
  }
}

function getSnapshot(): Consent {
  if (cache === null) cache = readStorage();
  return cache;
}

// Nothing renders on the server, so returning visitors never see the banner flash.
function getServerSnapshot(): Consent {
  return "pending";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function saveChoice(choice: Choice) {
  cache = choice;
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* private mode: the choice still holds for this page session */
  }
  listeners.forEach((listener) => listener());
}

const buttonClass = "rounded-md px-5 py-2.5 text-sm font-semibold transition";

export function CookieBanner() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (consent !== "unset") return null;

  return (
    <section aria-label="Cookie notice" className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-md bg-white p-5 shadow-lg ring-1 ring-ink/10 md:flex-row md:items-center md:justify-between md:gap-8">
        <p className="text-sm text-muted">
          We use essential cookies and similar technologies to keep the site working, like remembering your cart. With
          your permission, we&apos;d also use optional cookies to understand how the site is used.{" "}
          {/* TODO: replace placeholder href with the real cookie policy page. */}
          <a href="#" className="font-medium text-ink underline underline-offset-2">
            Cookie policy
          </a>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => saveChoice("rejected")}
            className={`${buttonClass} flex-1 bg-ink text-white hover:bg-ink/85 md:flex-none`}
          >
            Reject optional
          </button>
          <button
            type="button"
            onClick={() => saveChoice("accepted")}
            className={`${buttonClass} flex-1 bg-brand text-ink hover:bg-brand-hover md:flex-none`}
          >
            Accept all
          </button>
        </div>
      </div>
    </section>
  );
}
