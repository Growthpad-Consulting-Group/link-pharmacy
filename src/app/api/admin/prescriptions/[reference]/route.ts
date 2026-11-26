import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { contactFor, loadContacts, toAdminPrescriptionView } from "@/lib/admin/views";
import { collections } from "@/lib/db/collections";
import { issuesFrom, prescriptionStatusSchema } from "@/lib/portal/schemas";

type Params = { params: Promise<{ reference: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await authorize("prescriptions:read");
  if ("response" in auth) return auth.response;
  const { admin } = auth;

  const { reference } = await params;
  const { prescriptions } = await collections();
  const doc = await prescriptions.findOne({ reference }, { projection: { fileId: 0 } });
  if (!doc) return NextResponse.json({ error: "Prescription not found" }, { status: 404 });

  const patients = await loadContacts([doc.patientId]);
  await recordAudit(admin.id, "prescription.view", reference);
  return NextResponse.json({ prescription: toAdminPrescriptionView(doc, contactFor(doc, patients)) });
}

/**
 * Moves a prescription through the pharmacy workflow. Marking it dispensed needs the pharmacist's
 * permission; every other status needs the review permission. Each change is kept in the history.
 */
export async function PATCH(request: Request, { params }: Params) {
  const body = await request.json().catch(() => null);
  const parsed = prescriptionStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const { status, note } = parsed.data;
  const needed = status === "dispensed" ? "prescriptions:dispense" : "prescriptions:review";
  const auth = await authorize(needed);
  if ("response" in auth) return auth.response;
  const { admin } = auth;

  const { reference } = await params;
  const now = new Date();
  const { prescriptions } = await collections();
  const result = await prescriptions.updateOne(
    { reference },
    {
      $set: { status, updatedAt: now },
      $push: { statusHistory: { status, note, by: admin.id, at: now } },
    },
  );
  if (result.matchedCount === 0) return NextResponse.json({ error: "Prescription not found" }, { status: 404 });

  const doc = await prescriptions.findOne({ reference }, { projection: { fileId: 0 } });
  if (!doc) return NextResponse.json({ error: "Prescription not found" }, { status: 404 });

  const patients = await loadContacts([doc.patientId]);
  await recordAudit(admin.id, "prescription.status", reference, status);
  return NextResponse.json({ prescription: toAdminPrescriptionView(doc, contactFor(doc, patients)) });
}
