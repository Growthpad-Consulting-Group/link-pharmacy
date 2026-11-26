import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { toAdminPrescriptionView } from "@/lib/admin/views";
import { collections } from "@/lib/db/collections";
import { toPatientView } from "@/lib/db/models";

/** One patient with all of their prescriptions. Viewing is recorded in the audit log. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize("patients:read");
  if ("response" in auth) return auth.response;
  const { admin } = auth;

  const { id } = await params;
  const { users, prescriptions } = await collections();
  const patient = await users.findOne({ _id: id }, { projection: { passwordHash: 0 } });
  if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

  const docs = await prescriptions.find({ patientId: id }).sort({ createdAt: -1 }).limit(200).toArray();
  const contact = { name: patient.name, email: patient.email, phone: patient.phone };

  await recordAudit(admin.id, "patient.view", id);
  return NextResponse.json({
    patient: toPatientView(patient),
    prescriptions: docs.map((doc) => toAdminPrescriptionView(doc, contact)),
  });
}
