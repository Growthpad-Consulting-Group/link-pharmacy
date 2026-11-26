"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import { inputClass } from "@/components/portal/form-ui";
import type { PatientView } from "@/lib/db/models";
import { Alert, Panel, formatDateTime } from "./format";
import { apiFetch, errorMessage } from "./api";
import { Pager } from "./pager";
import { TableSkeleton } from "./loading";

type SearchResponse = { patients: PatientView[]; total: number; pageSize: number };

export function PatientSearch() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page) });
    if (query) params.set("q", query);
    apiFetch<SearchResponse>(`/api/admin/patients?${params}`)
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
  }, [query, page]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(input.trim());
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Patients</h1>
        <p className="text-sm text-muted">Search by name, email or phone. Every search is recorded.</p>
      </div>

      <form onSubmit={search} role="search" className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="patient-search">
          Search patients
        </label>
        <div className="relative flex-1">
          <Icon icon="lucide:search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="patient-search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Name, email or phone"
            maxLength={100}
            className={`${inputClass} mt-0 pl-9`}
          />
        </div>
        <button type="submit" className="rounded-md bg-ink px-5 py-2.5 font-semibold text-white transition hover:bg-ink/85">
          Search
        </button>
      </form>

      {error && <Alert tone="error">{error}</Alert>}

      <Panel>
        {!data && !error && <TableSkeleton rows={8} />}
        {data && data.patients.length === 0 && <p className="py-8 text-center text-muted">No patients found.</p>}
        {data && data.patients.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Phone</th>
                    <th className="pb-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-4">
                        <Link href={`/admin/patients/${patient.id}`} className="font-semibold text-ink hover:underline">
                          {patient.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-ink/80">{patient.email}</td>
                      <td className="py-3 pr-4 text-ink/80">{patient.phone}</td>
                      <td className="py-3 text-muted">{formatDateTime(patient.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={page} total={data.total} pageSize={data.pageSize} onPage={setPage} />
          </>
        )}
      </Panel>
    </div>
  );
}
