"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AdminPrescriptionView } from "@/lib/admin/views";
import type { PatientView } from "@/lib/db/models";
import { Alert, Panel, StatusPill, formatDateTime } from "./format";
import { apiFetch, errorMessage } from "./api";
import { DetailSkeleton } from "./loading";

type PatientResponse = { patient: PatientView; prescriptions: AdminPrescriptionView[] };

export function PatientDetail({ id }: { id: string }) {
  const [data, setData] = useState<PatientResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<PatientResponse>(`/api/admin/patients/${encodeURIComponent(id)}`)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!data) return <DetailSkeleton />;

  const { patient, prescriptions } = data;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/patients" className="text-sm font-semibold text-muted hover:text-ink">
          ← Back to patients
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">{patient.name}</h1>
        <p className="text-sm text-muted">Patient since {formatDateTime(patient.createdAt)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Panel title="Details">
          <dl className="grid gap-4 text-sm">
            <Row label="Email" value={patient.email} />
            <Row label="Phone" value={patient.phone} />
            <Row label="Date of birth" value={patient.dateOfBirth} />
            <Row label="Address" value={patient.address} />
            <Row label="Medical aid" value={patient.medicalAid} />
            <Row label="Allergies and conditions" value={patient.allergies} />
            <Row label="Emergency contact" value={patient.emergencyContact} />
          </dl>
        </Panel>

        <Panel title={`Prescriptions (${prescriptions.length})`}>
          {prescriptions.length === 0 ? (
            <p className="py-6 text-center text-muted">No prescriptions yet.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {prescriptions.map((item) => (
                <li key={item.reference}>
                  <Link
                    href={`/admin/prescriptions/${encodeURIComponent(item.reference)}`}
                    className="flex flex-col gap-2 py-3 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-ink">{item.reference}</p>
                      <p className="text-sm text-muted">
                        {formatDateTime(item.createdAt)} · {item.originalName}
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
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-ink">{value || "—"}</dd>
    </div>
  );
}
