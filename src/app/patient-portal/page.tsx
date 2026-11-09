import { Icon } from "@iconify/react";

export const metadata = { title: "Patient portal" };

export default function PatientPortalPage() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 py-20 text-center">
      <Icon icon="lucide:stethoscope" className="h-12 w-12 text-muted" aria-hidden />
      <h1 className="text-2xl font-bold">Patient portal</h1>
      <p className="max-w-sm text-muted">Prescriptions and health records are coming soon.</p>
    </div>
  );
}
