import { NextResponse } from "next/server";
import type { Filter } from "mongodb";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { PAGE_SIZE, contactFor, loadContacts, pageFrom, toAdminPrescriptionView } from "@/lib/admin/views";
import { collections } from "@/lib/db/collections";
import { PRESCRIPTION_STATUSES, type PrescriptionDoc, type PrescriptionStatus } from "@/lib/db/models";

/** The prescription queue. Filter with ?status=received, and page with ?page=2. */
export async function GET(request: Request) {
  const auth = await authorize("prescriptions:read");
  if ("response" in auth) return auth.response;
  const { admin } = auth;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const filter: Filter<PrescriptionDoc> = {};
  if (status) {
    if (!(PRESCRIPTION_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: "Unknown status" }, { status: 422 });
    }
    filter.status = status as PrescriptionStatus;
  }

  const { prescriptions } = await collections();
  const docs = await prescriptions
    .find(filter, { projection: { fileId: 0 } })
    .sort({ createdAt: -1 })
    .skip((pageFrom(url) - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .toArray();
  const total = await prescriptions.countDocuments(filter);

  const patients = await loadContacts(docs.map((doc) => doc.patientId));
  await recordAudit(admin.id, "prescriptions.list", status ?? "all");
  return NextResponse.json({
    prescriptions: docs.map((doc) => toAdminPrescriptionView(doc, contactFor(doc, patients))),
    total,
    pageSize: PAGE_SIZE,
  });
}
