"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import type { AdminPrescriptionView } from "@/lib/admin/views";
import type { Permission } from "@/lib/admin/permissions";
import { PRESCRIPTION_STATUSES, type PrescriptionStatus } from "@/lib/db/models";
import { inputClass } from "@/components/portal/form-ui";
import { Alert, Panel, STATUS_LABEL, StatusPill, formatDateTime } from "./format";
import { useAdmin, can } from "./admin-context";
import { apiFetch, errorMessage } from "./api";
import { DetailSkeleton, Spinner } from "./loading";

// Which permission lets someone set each status.
function permissionFor(status: PrescriptionStatus): Permission {
  return status === "dispensed" ? "prescriptions:dispense" : "prescriptions:review";
}

export function PrescriptionDetail({ reference }: { reference: string }) {
  const admin = useAdmin();
  const path = `/api/admin/prescriptions/${encodeURIComponent(reference)}`;
  const [item, setItem] = useState<AdminPrescriptionView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<PrescriptionStatus>("in_review");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ prescription: AdminPrescriptionView }>(path)
      .then((result) => {
        if (cancelled) return;
        setItem(result.prescription);
        setStatus(result.prescription.status);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  // Only the statuses this role may set appear in the picker.
  const allowedStatuses = PRESCRIPTION_STATUSES.filter((value) => can(admin, permissionFor(value)));
  const canOpenFile = can(admin, "prescriptions:file");

  async function handleStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const note = String(new FormData(event.currentTarget).get("note") ?? "");
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const result = await apiFetch<{ prescription: AdminPrescriptionView }>(path, { method: "PATCH", body: { status, note } });
      setItem(result.prescription);
      setStatus(result.prescription.status);
      event.currentTarget.reset();
      setMessage(`Status set to ${STATUS_LABEL[result.prescription.status]}.`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (error && !item) return <Alert tone="error">{error}</Alert>;
  if (!item) return <DetailSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin" className="text-sm font-semibold text-muted hover:text-ink">
            ← Back to queue
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-ink">{item.reference}</h1>
          <p className="text-sm text-muted">Received {formatDateTime(item.createdAt)}</p>
        </div>
        <StatusPill status={item.status} />
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Panel title="Patient">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Detail label="Name" value={item.contact.name} />
              <Detail label="Phone" value={item.contact.phone} />
              <Detail label="Email" value={item.contact.email} />
              <Detail label="Source" value={item.source === "portal" ? "Patient account" : "Guest upload"} />
            </dl>
            {item.patientId && (
              <Link href={`/admin/patients/${item.patientId}`} className="mt-4 inline-block text-sm font-semibold text-ink hover:underline">
                Open patient record →
              </Link>
            )}
          </Panel>

          <Panel title="Prescription">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Detail label="File" value={`${item.originalName} (${Math.max(1, Math.round(item.size / 1024))} KB)`} />
              <Detail label="Notes from patient" value={item.notes || "None"} />
            </dl>
            <div className="mt-5">
              {canOpenFile ? (
                <a
                  href={`${path}/file`}
                  className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/85"
                >
                  <Icon icon="lucide:download" className="h-4 w-4 text-brand" aria-hidden />
                  Download prescription file
                </a>
              ) : (
                <p className="text-sm text-muted">Your role cannot open prescription files. Ask a doctor or pharmacist.</p>
              )}
            </div>
          </Panel>

          <Panel title="History">
            <ol className="space-y-4">
              {[...item.statusHistory].reverse().map((entry, index) => (
                <li key={`${entry.at}-${index}`} className="border-l-2 border-slate-200 pl-4">
                  <p className="font-semibold text-ink">{STATUS_LABEL[entry.status]}</p>
                  <p className="text-xs text-muted">
                    {formatDateTime(entry.at)} · {entry.by === "system" ? "Received online" : "Staff member"}
                  </p>
                  {entry.note && <p className="mt-1 text-sm text-ink/80">{entry.note}</p>}
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <aside>
          <Panel title="Update status">
            {allowedStatuses.length === 0 ? (
              <p className="flex items-start gap-2 text-sm text-muted">
                <Icon icon="lucide:lock" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                Your role cannot change this prescription&apos;s status.
              </p>
            ) : (
              <form onSubmit={handleStatus} className="space-y-4">
                <label className="block text-sm font-medium text-ink">
                  New status
                  <select value={status} onChange={(e) => setStatus(e.target.value as PrescriptionStatus)} className={inputClass}>
                    {allowedStatuses.map((value) => (
                      <option key={value} value={value}>
                        {STATUS_LABEL[value]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-ink">
                  Note <span className="font-normal text-muted">(optional, visible in history)</span>
                  <textarea name="note" rows={3} maxLength={500} className={`${inputClass} resize-y`} />
                </label>
                <button
                  type="submit"
                  disabled={saving || status === item.status}
                  className="w-full rounded-md bg-ink px-5 py-3 font-semibold text-white transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner /> Saving…
                    </span>
                  ) : (
                    "Save status"
                  )}
                </button>
                {!allowedStatuses.includes("dispensed") && (
                  <p className="text-xs text-muted">Only a pharmacist can mark a prescription as dispensed.</p>
                )}
              </form>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-ink">{value || "—"}</dd>
    </div>
  );
}
