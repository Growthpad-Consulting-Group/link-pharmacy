"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import type { Branch } from "@/lib/branches";
import { Alert, Panel, Tag } from "./format";
import { apiFetch, errorMessage } from "./api";
import { TableSkeleton } from "./loading";

export function BranchesList() {
  const [branches, setBranches] = useState<Branch[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ branches: Branch[] }>("/api/admin/branches")
      .then((result) => {
        if (!cancelled) setBranches(result.branches);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Branches</h1>
          <p className="text-sm text-muted">The pharmacies shown on Find a pharmacy and About us.</p>
        </div>
        <Link
          href="/admin/branches/new"
          className="inline-flex items-center gap-2 self-start rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/85"
        >
          <Icon icon="lucide:plus" className="h-4 w-4 text-brand" aria-hidden />
          New branch
        </Link>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Panel>
        {!branches && !error && <TableSkeleton rows={3} />}
        {branches && branches.length === 0 && <p className="py-8 text-center text-muted">No branches yet.</p>}
        {branches && branches.length > 0 && (
          <ul className="divide-y divide-slate-200">
            {branches.map((branch) => (
              <li key={branch.id}>
                <Link
                  href={`/admin/branches/${encodeURIComponent(branch.id)}`}
                  className="flex flex-col gap-2 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-2"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{branch.name}</p>
                    <p className="truncate text-sm text-muted">
                      {branch.address}, {branch.city} · {branch.phone}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {branch.services.map((service) => (
                      <Tag key={service} tone="lime">
                        {service}
                      </Tag>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
