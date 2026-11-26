"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import type { PrescriptionStatus, PrescriptionView } from "@/lib/db/models";
import { FormAlert } from "./form-ui";

const STATUS: Record<PrescriptionStatus, { label: string; tone: string }> = {
  received: { label: "Received", tone: "bg-amber-100 text-amber-900" },
  in_review: { label: "Being checked", tone: "bg-sky-100 text-sky-900" },
  ready: { label: "Ready to collect", tone: "bg-brand/30 text-ink" },
  dispensed: { label: "Dispensed", tone: "bg-slate-200 text-slate-800" },
  rejected: { label: "Needs your attention", tone: "bg-rose-100 text-rose-800" },
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
}

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** The patient's prescriptions, newest first. Pass `limit` to show only the most recent ones. */
export function MyPrescriptions({ limit }: { limit?: number }) {
  const [items, setItems] = useState<PrescriptionView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/portal/prescriptions", { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Could not load your prescriptions");
        if (!cancelled) setItems(body.prescriptions);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Could not load your prescriptions");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <FormAlert message={error} />;

  if (!items) {
    return (
      <div role="status" aria-label="Loading" className="space-y-3">
        {Array.from({ length: limit ?? 3 }, (_, index) => (
          <div key={index} className="h-16 rounded-lg bg-slate-100 motion-safe:animate-pulse" />
        ))}
        <span className="sr-only">Loading your prescriptions…</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Icon icon="lucide:file-text" className="h-6 w-6 text-muted" aria-hidden />
        </span>
        <p className="font-semibold text-ink">No prescriptions yet</p>
        <p className="max-w-xs text-sm text-muted">Prescriptions you upload will appear here with their status.</p>
      </div>
    );
  }

  const shown = limit ? items.slice(0, limit) : items;

  return (
    <ul className="divide-y divide-slate-100">
      {shown.map((item) => (
        <li key={item.reference} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Icon icon="lucide:file-text" className="h-5 w-5 text-ink" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{item.originalName}</p>
              <p className="text-sm text-muted">
                {item.reference} · {formatDate(item.createdAt)} · {formatSize(item.size)}
              </p>
              {item.notes && <p className="mt-1 text-sm text-ink/80">{item.notes}</p>}
            </div>
          </div>
          <span className={`inline-flex shrink-0 self-start rounded-full px-2.5 py-1 text-xs font-semibold sm:self-center ${STATUS[item.status].tone}`}>
            {STATUS[item.status].label}
          </span>
        </li>
      ))}
    </ul>
  );
}
