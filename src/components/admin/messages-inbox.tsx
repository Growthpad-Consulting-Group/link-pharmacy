"use client";

import { useEffect, useState } from "react";
import type { ContactStatus } from "@/lib/db/models";
import { Alert, Panel, Tag, formatDateTime } from "./format";
import { useAdmin, can } from "./admin-context";
import { apiFetch, errorMessage } from "./api";
import { Pager } from "./pager";
import { TableSkeleton } from "./loading";

type Message = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
};
type MessagesResponse = { messages: Message[]; total: number; page: number; pageSize: number };

const TOPIC_LABEL: Record<string, string> = {
  order: "Order",
  prescription: "Prescription",
  product: "Product",
  clinic: "Clinic",
  other: "Other",
};

export function MessagesInbox() {
  const admin = useAdmin();
  const canManage = can(admin, "messages:manage");
  const [status, setStatus] = useState<ContactStatus | "">("new");
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [data, setData] = useState<MessagesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const query = new URLSearchParams({ page: String(page) });
    if (status) query.set("status", status);
    apiFetch<MessagesResponse>(`/api/admin/messages?${query}`)
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
  }, [status, page, version]);

  async function setMessageStatus(id: string, next: ContactStatus) {
    setError(null);
    try {
      await apiFetch(`/api/admin/messages/${id}`, { method: "PATCH", body: { status: next } });
      setVersion((v) => v + 1);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const filters: { value: ContactStatus | ""; label: string }[] = [
    { value: "new", label: "New" },
    { value: "handled", label: "Handled" },
    { value: "", label: "All" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Contact messages</h1>
        <p className="text-sm text-muted">Messages sent through the website contact form.</p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter messages">
        {filters.map((filter) => (
          <button
            key={filter.label}
            type="button"
            aria-pressed={status === filter.value}
            onClick={() => {
              setStatus(filter.value);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${status === filter.value ? "border-ink bg-ink text-white" : "border-slate-300 bg-white text-ink hover:border-ink"}`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Panel>
        {!data && !error && <TableSkeleton rows={4} />}
        {data && data.messages.length === 0 && <p className="py-8 text-center text-muted">No messages here.</p>}
        {data && data.messages.length > 0 && (
          <>
            <ul className="divide-y divide-slate-200">
              {data.messages.map((item) => (
                <li key={item.id} className="space-y-3 py-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">
                        {item.name} <span className="font-normal text-muted">· {formatDateTime(item.createdAt)}</span>
                      </p>
                      <a href={`mailto:${item.email}`} className="text-sm text-ink underline-offset-2 hover:underline">
                        {item.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag tone="slate">{TOPIC_LABEL[item.topic] ?? item.topic}</Tag>
                      <Tag tone={item.status === "new" ? "amber" : "emerald"}>{item.status === "new" ? "New" : "Handled"}</Tag>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/85">{item.message}</p>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setMessageStatus(item.id, item.status === "new" ? "handled" : "new")}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-slate-100"
                    >
                      {item.status === "new" ? "Mark as handled" : "Reopen"}
                    </button>
                  )}
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
