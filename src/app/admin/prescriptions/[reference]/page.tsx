import { PrescriptionDetail } from "@/components/admin/prescription-detail";

export default async function AdminPrescriptionPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return <PrescriptionDetail reference={reference} />;
}
