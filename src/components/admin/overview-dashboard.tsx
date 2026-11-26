"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useState } from "react";
import type { OverviewData } from "@/lib/admin/overview";
import type { PrescriptionStatus } from "@/lib/db/models";
import { Alert, Panel, STATUS_LABEL, StatusPill, formatDateTime } from "./format";
import { Skeleton } from "./loading";
import { apiFetch, errorMessage } from "./api";

const SEGMENT_TONE: Record<PrescriptionStatus, string> = {
  received: "bg-amber-400",
  in_review: "bg-sky-400",
  ready: "bg-brand",
  dispensed: "bg-slate-400",
  rejected: "bg-rose-500",
};

const STATUS_ORDER: PrescriptionStatus[] = ["received", "in_review", "ready", "dispensed", "rejected"];

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** The admin home page: headline numbers for the areas the signed-in role can see. */
export function DashboardOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setData(await apiFetch<OverviewData>("/api/admin/overview"));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Load once on open. Refresh is manual so the numbers do not jump while someone is reading them.
  useEffect(() => {
    let cancelled = false;
    apiFetch<OverviewData>("/api/admin/overview")
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
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Overview</h1>
          <p className="text-sm text-muted">Headline numbers for today and the last 30 days. Days are counted in UTC.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted">
          {data && <span>Updated {formatDateTime(data.generatedAt)}</span>}
          <button
            type="button"
            onClick={() => void load()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 font-semibold text-ink transition hover:bg-slate-50 disabled:opacity-60"
          >
            <Icon icon="lucide:refresh-cw" className={`h-4 w-4 ${refreshing ? "motion-safe:animate-spin" : ""}`} aria-hidden />
            Refresh
          </button>
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {!data && !error && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.prescriptions && (
              <StatCard
                label="Prescriptions received today"
                value={data.prescriptions.receivedToday}
                hint={`${data.prescriptions.byStatus.received + data.prescriptions.byStatus.in_review} awaiting review`}
                icon="lucide:clipboard-list"
                href="/admin"
              />
            )}
            {data.inbox && (
              <StatCard
                label="New messages"
                value={data.inbox.newMessages}
                hint={`${data.inbox.newAppointments} new appointment ${data.inbox.newAppointments === 1 ? "request" : "requests"} · ${data.inbox.messagesThisWeek} this week`}
                icon="lucide:mail"
                href="/admin/messages"
              />
            )}
            {data.inbox && (
              <StatCard
                label="Newsletter subscribers"
                value={data.inbox.subscribers}
                hint={`+${data.inbox.newSubscribersThisWeek} this week`}
                icon="lucide:mails"
                href="/admin/subscribers"
              />
            )}
            {data.orders && (
              <StatCard
                label="Orders, last 30 days"
                value={data.orders.last30Days}
                hint={
                  data.orders.revenue.length
                    ? data.orders.revenue.map((r) => formatMoney(r.amount, r.currency)).join(" · ")
                    : "No orders yet"
                }
                icon="lucide:shopping-bag"
                href="/admin/orders"
              />
            )}
            {data.content && (
              <StatCard
                label="Published articles"
                value={data.content.published}
                hint={`${data.content.drafts} ${data.content.drafts === 1 ? "draft" : "drafts"}`}
                icon="lucide:newspaper"
                href="/admin/articles"
              />
            )}
            {data.staff && (
              <StatCard label="Active staff accounts" value={data.staff.active} hint="Signed-in access enabled" icon="lucide:shield-check" href="/admin/staff" />
            )}
          </div>

          {data.prescriptions && (
            <div className="grid gap-6 xl:grid-cols-3">
              <Panel title="Prescription pipeline" action={<span className="text-xs text-muted">Current counts</span>}>
                <PipelineBar counts={data.prescriptions.byStatus} />
              </Panel>

              <div className="xl:col-span-2">
                <Panel title="Prescriptions, last 14 days">
                  <TrendChart trend={data.prescriptions.trend} />
                </Panel>
              </div>

              <div className="xl:col-span-3">
                <Panel
                  title="Latest prescriptions"
                  action={
                    <Link href="/admin" className="text-sm font-semibold text-ink hover:underline">
                      Open queue
                    </Link>
                  }
                >
                  {data.prescriptions.recent.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted">No prescriptions yet.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {data.prescriptions.recent.map((item) => (
                        <li key={item.reference}>
                          <Link href={`/admin/prescriptions/${item.reference}`} className="flex items-center justify-between gap-4 py-3 transition hover:bg-slate-50">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink">{item.originalName}</p>
                              <p className="text-xs text-muted">
                                {item.reference} · {formatDateTime(item.createdAt)}
                              </p>
                            </div>
                            <StatusPill status={item.status} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, hint, icon, href }: { label: string; value: number; hint: string; icon: string; href: string }) {
  return (
    <Link href={href} className="group flex flex-col gap-4 rounded-sm border border-slate-200 bg-white p-5 transition hover:border-ink/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-muted">{label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand/25">
          <Icon icon={icon} className="h-4 w-4 text-ink" aria-hidden />
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-ink">{value.toLocaleString("en")}</p>
        <p className="mt-1 text-xs text-muted">{hint}</p>
      </div>
    </Link>
  );
}

function PipelineBar({ counts }: { counts: Record<PrescriptionStatus, number> }) {
  const total = STATUS_ORDER.reduce((sum, status) => sum + counts[status], 0);
  return (
    <div className="space-y-5">
      <div className="flex h-4 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`${total} prescriptions in total`}>
        {total > 0 &&
          STATUS_ORDER.map((status) =>
            counts[status] > 0 ? (
              <span key={status} className={SEGMENT_TONE[status]} style={{ width: `${(counts[status] / total) * 100}%` }} title={`${STATUS_LABEL[status]}: ${counts[status]}`} />
            ) : null,
          )}
      </div>
      <ul className="space-y-3 text-sm">
        {STATUS_ORDER.map((status) => (
          <li key={status} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-ink">
              <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${SEGMENT_TONE[status]}`} />
              {STATUS_LABEL[status]}
            </span>
            <span className="font-semibold text-ink">{counts[status].toLocaleString("en")}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">{total.toLocaleString("en")} prescriptions in total</p>
    </div>
  );
}

function TrendChart({ trend }: { trend: { date: string; count: number }[] }) {
  const max = Math.max(1, ...trend.map((day) => day.count));
  const total = trend.reduce((sum, day) => sum + day.count, 0);
  return (
    <div className="space-y-4">
      <div className="flex h-44 items-end gap-1.5" role="img" aria-label={`${total} prescriptions over the last 14 days`}>
        {trend.map((day) => (
          <div key={day.date} className="flex h-full flex-1 flex-col justify-end" title={`${day.date}: ${day.count}`}>
            <span
              className={`w-full rounded-t-sm ${day.count > 0 ? "bg-ink" : "bg-slate-100"}`}
              style={{ height: `${day.count > 0 ? Math.max(6, (day.count / max) * 100) : 4}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>{trend[0] ? shortDate(trend[0].date) : ""}</span>
        <span>{total} in 14 days</span>
        <span>{trend.at(-1) ? shortDate(trend.at(-1)!.date) : ""}</span>
      </div>
    </div>
  );
}

function shortDate(isoDay: string): string {
  return new Date(`${isoDay}T00:00:00Z`).toLocaleDateString("en", { day: "numeric", month: "short", timeZone: "UTC" });
}
