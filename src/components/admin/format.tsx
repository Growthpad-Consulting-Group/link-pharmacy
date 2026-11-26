import type { ReactNode } from "react";
import type { PrescriptionStatus } from "@/lib/db/models";

export const STATUS_LABEL: Record<PrescriptionStatus, string> = {
  received: "Received",
  in_review: "In review",
  ready: "Ready for collection",
  dispensed: "Dispensed",
  rejected: "Rejected",
};

const STATUS_TONE: Record<PrescriptionStatus, string> = {
  received: "bg-amber-100 text-amber-900",
  in_review: "bg-sky-100 text-sky-900",
  ready: "bg-brand/30 text-ink",
  dispensed: "bg-slate-200 text-slate-800",
  rejected: "bg-rose-100 text-rose-800",
};

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export function StatusPill({ status }: { status: PrescriptionStatus }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Panel({ title, children, action }: { title?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-sm border border-slate-200 bg-white">
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3">
          {title && <h2 className="font-semibold text-ink">{title}</h2>}
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const TAG_TONES = {
  amber: "bg-amber-100 text-amber-900",
  sky: "bg-sky-100 text-sky-900",
  lime: "bg-brand/30 text-ink",
  slate: "bg-slate-200 text-slate-800",
  rose: "bg-rose-100 text-rose-800",
  emerald: "bg-emerald-100 text-emerald-900",
} as const;

/** A small coloured label for statuses, topics and flags. */
export function Tag({ tone, children }: { tone: keyof typeof TAG_TONES; children: ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TAG_TONES[tone]}`}>
      {children}
    </span>
  );
}

export function Alert({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  const classes = tone === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-brand/40 bg-[#F4F8D5] text-ink";
  return <p role={tone === "error" ? "alert" : "status"} className={`rounded-md border px-4 py-3 text-sm ${classes}`}>{children}</p>;
}
