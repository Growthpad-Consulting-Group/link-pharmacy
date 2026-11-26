"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AdminPrescriptionView } from "@/lib/admin/views";
import { PRESCRIPTION_STATUSES, type PrescriptionStatus } from "@/lib/db/models";
import { Alert, Panel, STATUS_LABEL, StatusPill, formatDateTime } from "./format";
import { apiFetch, errorMessage } from "./api";
import { Pager } from "./pager";
import { TableSkeleton } from "./loading";

type QueueResponse = { prescriptions: AdminPrescriptionView[]; total: number; pageSize: number };

export function PrescriptionQueue() {
  const [status, setStatus] = useState<PrescriptionStatus | "">("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<QueueResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const query = new URLSearchParams({ page: String(page) });
    if (status) query.set("status", status);
    apiFetch<QueueResponse>(`/api/admin/prescriptions?${query}`)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [status, page]);

  function changeFilter(next: PrescriptionStatus | "") {
    setStatus(next);
    setPage(1);
  }

  const filters: { value: PrescriptionStatus | ""; label: string }[] = [
    { value: "", label: "All" },
    ...PRESCRIPTION_STATUSES.map((value) => ({ value, label: STATUS_LABEL[value] })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Prescription queue</h1>
        <p className="text-sm text-muted">Newest first. Open a prescription to review it.</p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {filters.map((filter) => (
          <button
            key={filter.value || "all"}
            type="button"
            aria-pressed={status === filter.value}
            onClick={() => changeFilter(filter.value)}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${status === filter.value ? "border-ink bg-ink text-white" : "border-slate-300 bg-white text-ink hover:border-ink"}`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Panel>
        {!data && !error && <TableSkeleton rows={6} />}
        {data && data.prescriptions.length === 0 && (
          <p className="py-8 text-center text-muted">No prescriptions match this filter.</p>
        )}
        {data && data.prescriptions.length > 0 && (
          <>
            <ul className="divide-y divide-slate-200">
              {data.prescriptions.map((item) => (
                <li key={item.reference}>
                  <Link
                    href={`/admin/prescriptions/${encodeURIComponent(item.reference)}`}
                    className="flex flex-col gap-2 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-2"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">
                        {item.contact.name || "Unnamed"}{" "}
                        <span className="font-normal text-muted">· {item.reference}</span>
                      </p>
                      <p className="truncate text-sm text-muted">
                        {formatDateTime(item.createdAt)} · {item.originalName} · {item.source === "portal" ? "Patient account" : "Guest upload"}
                      </p>
                    </div>
                    <StatusPill status={item.status} />
                  </Link>
                </li>
              ))}
            </ul>
            <Pager page={page} total={data.total} pageSize={data.pageSize} onPage={setPage} />
          </>
        )}
      </Panel>
    </div>
  );
}
