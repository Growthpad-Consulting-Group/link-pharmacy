import { PatientDetail } from "@/components/admin/patient-detail";

export default async function AdminPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PatientDetail id={id} />;
}
