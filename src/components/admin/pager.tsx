"use client";

export function Pager({
  page,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const button = "rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink";
  return (
    <div className="flex items-center justify-between gap-4 pt-4 text-sm text-muted">
      <p>
        Page {page} of {pages} · {total} total
      </p>
      <div className="flex gap-2">
        <button type="button" className={button} disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </button>
        <button type="button" className={button} disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
