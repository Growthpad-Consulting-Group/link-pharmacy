"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import { inputClass } from "@/components/portal/form-ui";
import { Alert, Panel, Tag, formatDateTime } from "./format";
import { useAdmin, can } from "./admin-context";
import { apiFetch, errorMessage } from "./api";
import { Pager } from "./pager";
import { TableSkeleton } from "./loading";

type Subscriber = { email: string; status: "subscribed" | "unsubscribed"; source: string; createdAt: string };
type SubscribersResponse = { subscribers: Subscriber[]; total: number; subscribed: number; page: number; pageSize: number };

export function SubscribersList() {
  const admin = useAdmin();
  const canManage = can(admin, "messages:manage");
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | "subscribed" | "unsubscribed">("");
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [data, setData] = useState<SubscribersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page) });
    if (query) params.set("q", query);
    if (status) params.set("status", status);
    apiFetch<SubscribersResponse>(`/api/admin/subscribers?${params}`)
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
  }, [query, status, page, version]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(input.trim());
    setPage(1);
  }

  async function setSubscription(email: string, next: "subscribed" | "unsubscribed") {
    setError(null);
    try {
      await apiFetch(`/api/admin/subscribers/${encodeURIComponent(email)}`, { method: "PATCH", body: { status: next } });
      setVersion((v) => v + 1);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Newsletter subscribers</h1>
          <p className="text-sm text-muted">
            {data ? `${data.subscribed} active subscribers` : "Loading…"} · people who asked to receive Link savings and deals.
          </p>
        </div>
        {canManage && (
          // A plain link is intended here: it downloads a file from a route handler.
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a
            href="/api/admin/subscribers/export"
            className="inline-flex items-center gap-2 self-start rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/85"
          >
            <Icon icon="lucide:download" className="h-4 w-4 text-brand" aria-hidden />
            Export CSV
          </a>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={search} role="search" className="flex flex-1 gap-2">
          <label className="sr-only" htmlFor="subscriber-search">
            Search by email
          </label>
          <input
            id="subscriber-search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by email"
            maxLength={100}
            className={`${inputClass} mt-0`}
          />
          <button type="submit" className="rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink/85">
            Search
          </button>
        </form>
        <label className="sr-only" htmlFor="subscriber-status">
          Filter by status
        </label>
        <select
          id="subscriber-status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "" | "subscribed" | "unsubscribed");
            setPage(1);
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink"
        >
          <option value="">All</option>
          <option value="subscribed">Subscribed</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Panel>
        {!data && !error && <TableSkeleton rows={6} />}
        {data && data.subscribers.length === 0 && <p className="py-8 text-center text-muted">No subscribers match.</p>}
        {data && data.subscribers.length > 0 && (
          <>
            <ul className="divide-y divide-slate-200">
              {data.subscribers.map((item) => (
                <li key={item.email} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{item.email}</p>
                    <p className="text-sm text-muted">
                      Joined {formatDateTime(item.createdAt)} · from {item.source}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag tone={item.status === "subscribed" ? "emerald" : "slate"}>
                      {item.status === "subscribed" ? "Subscribed" : "Unsubscribed"}
                    </Tag>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() =>
                          setSubscription(item.email, item.status === "subscribed" ? "unsubscribed" : "subscribed")
                        }
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-slate-100"
                      >
                        {item.status === "subscribed" ? "Unsubscribe" : "Resubscribe"}
                      </button>
                    )}
                  </div>
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
