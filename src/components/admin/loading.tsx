// Loading states for the admin screens. Spinners and skeletons respect the user's reduced-motion setting.

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin ${className}`}
    />
  );
}

/** Full-area loader with the brand mark and a short message. */
export function AdminLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-5 py-20 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-ink shadow-sm">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border-[3px] border-brand border-t-transparent motion-safe:animate-spin"
        />
        <img src="/link-logo.svg" alt="" className="h-4 w-auto opacity-90" />
      </div>
      <p className="text-sm font-medium text-muted">{label}</p>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-md bg-slate-200/80 motion-safe:animate-pulse ${className}`} />;
}

/** Placeholder rows for a list or table while its data loads. */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" className="divide-y divide-slate-200">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center justify-between gap-4 py-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** Placeholder for a detail page: a heading and two cards. */
export function DetailSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="space-y-6">
      <Skeleton className="h-4 w-28" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {[0, 1].map((card) => (
          <div key={card} className="space-y-4 rounded-sm border border-slate-200 bg-white p-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
