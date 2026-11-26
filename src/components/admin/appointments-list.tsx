"use client";

import { useEffect, useState } from "react";
import { APPOINTMENT_STATUSES, type AppointmentStatus } from "@/lib/db/models";
import { Alert, Panel, formatDateTime } from "./format";
import { useAdmin, can } from "./admin-context";
import { apiFetch, errorMessage } from "./api";
import { Pager } from "./pager";
import { TableSkeleton } from "./loading";

type Appointment = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: AppointmentStatus;
  createdAt: string;
};
type AppointmentsResponse = { appointments: Appointment[]; total: number; page: number; pageSize: number };

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  new: "New",
  contacted: "Contacted",
  booked: "Booked",
  closed: "Closed",
};

export function AppointmentsList() {
  const admin = useAdmin();
  const canManage = can(admin, "messages:manage");
  const [status, setStatus] = useState<AppointmentStatus | "">("");
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [data, setData] = useState<AppointmentsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const query = new URLSearchParams({ page: String(page) });
    if (status) query.set("status", status);
    apiFetch<AppointmentsResponse>(`/api/admin/appointments?${query}`)
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

  async function changeStatus(id: string, next: AppointmentStatus) {
    setError(null);
    try {
      await apiFetch(`/api/admin/appointments/${id}`, { method: "PATCH", body: { status: next } });
      setVersion((v) => v + 1);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Appointment requests</h1>
          <p className="text-sm text-muted">Requests from the website. Contact the patient, then update the status.</p>
        </div>
        <label className="text-sm font-medium text-ink">
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as AppointmentStatus | "");
              setPage(1);
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="">All statuses</option>
            {APPOINTMENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABEL[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Panel>
        {!data && !error && <TableSkeleton rows={5} />}
        {data && data.appointments.length === 0 && <p className="py-8 text-center text-muted">No appointment requests here.</p>}
        {data && data.appointments.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="pb-3 font-semibold">Reference</th>
                    <th className="pb-3 font-semibold">Patient</th>
                    <th className="pb-3 font-semibold">Message</th>
                    <th className="pb-3 font-semibold">Received</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.appointments.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="py-3 pr-4 font-semibold text-ink">{item.reference}</td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-ink">{item.name}</p>
                        <p className="text-muted">{item.email}</p>
                        <p className="text-muted">{item.phone}</p>
                      </td>
                      <td className="max-w-xs py-3 pr-4 text-ink/85">
                        <p className="whitespace-pre-wrap">{item.message}</p>
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 text-muted">{formatDateTime(item.createdAt)}</td>
                      <td className="py-3">
                        <label className="sr-only" htmlFor={`status-${item.id}`}>
                          Status for {item.reference}
                        </label>
                        <select
                          id={`status-${item.id}`}
                          value={item.status}
                          disabled={!canManage}
                          onChange={(e) => changeStatus(item.id, e.target.value as AppointmentStatus)}
                          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-ink disabled:opacity-60"
                        >
                          {APPOINTMENT_STATUSES.map((value) => (
                            <option key={value} value={value}>
                              {STATUS_LABEL[value]}
                            </option>
                          ))}
                        </select>
                      </td>
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
