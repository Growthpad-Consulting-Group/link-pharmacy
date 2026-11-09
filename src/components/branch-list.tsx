"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { SERVICES, type Branch } from "@/lib/branches";

/** Search and service filter over the branch list, with directions and call links per branch. */
export function BranchList({ branches }: { branches: Branch[] }) {
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<string[]>([]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return branches.filter(
      (b) =>
        (!term || `${b.name} ${b.address} ${b.city}`.toLowerCase().includes(term)) &&
        services.every((s) => b.services.includes(s)),
    );
  }, [branches, query, services]);

  function toggleService(service: string) {
    setServices((current) =>
      current.includes(service) ? current.filter((s) => s !== service) : [...current, service],
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-5 rounded-sm bg-[#F7F9F6] p-5 sm:p-6">
        <label className="relative block">
          <span className="sr-only">Search by town, street or branch name</span>
          <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/70" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by town, street or branch"
            className="w-full rounded-md border border-slate-300 bg-white py-3 pl-10 pr-4 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
          />
        </label>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">Services</legend>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((service) => {
              const active = services.includes(service);
              return (
                <button
                  key={service}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleService(service)}
                  className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition ${active ? "bg-ink text-white" : "border border-slate-300 bg-white text-ink hover:bg-slate-100"}`}
                >
                  {service}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <p className="text-sm text-muted" aria-live="polite">
        {results.length} {results.length === 1 ? "branch" : "branches"} found
      </p>

      {results.length === 0 ? (
        <div className="rounded-sm border border-dashed border-slate-300 py-14 text-center">
          <p className="font-semibold text-ink">No branches match your search.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setServices([]);
            }}
            className="mt-3 font-semibold text-ink hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {results.map((b) => (
            <li key={b.id} className="flex flex-col gap-4 rounded-sm border border-slate-200 bg-white p-6">
              <div>
                <h2 className="text-lg font-bold text-ink">{b.name}</h2>
                <p className="mt-1 flex items-start gap-2 text-sm text-muted">
                  <Icon icon="lucide:map-pin" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {b.address}
                </p>
              </div>

              <ul className="flex flex-wrap gap-2">
                {b.services.map((s) => (
                  <li key={s} className="rounded-md bg-[#F4F8D5] px-2.5 py-1 text-xs font-semibold text-ink">
                    {s}
                  </li>
                ))}
              </ul>

              <div className="space-y-2 text-sm text-ink/80">
                <p className="flex items-start gap-2">
                  <Icon icon="lucide:clock" className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                  {b.hours}
                </p>
                <p className="flex items-center gap-2">
                  <Icon icon="lucide:phone" className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                  <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="hover:underline">{b.phone}</a>
                </p>
              </div>

              <div className="mt-auto flex flex-wrap gap-3 pt-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/85"
                >
                  <Icon icon="lucide:navigation" className="h-4 w-4 text-brand" aria-hidden />
                  Get directions
                </a>
                <a
                  href={`tel:${b.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-slate-100"
                >
                  Call branch
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
