import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { collections } from "@/lib/db/collections";
import { readPrescriptionFile } from "@/lib/prescription-files";

/** Downloads the original prescription file. Never cached, and every download is recorded. */
export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const auth = await authorize("prescriptions:file");
  if ("response" in auth) return auth.response;
  const { admin } = auth;

  const { reference } = await params;
  const { prescriptions } = await collections();
  const doc = await prescriptions.findOne({ reference }, { projection: { fileId: 1, originalName: 1, contentType: 1 } });
  if (!doc) return NextResponse.json({ error: "Prescription not found" }, { status: 404 });

  await recordAudit(admin.id, "prescription.download", reference, doc.originalName);
  const bytes = await readPrescriptionFile(doc.fileId);
  const safeName = doc.originalName.replace(/[^\w.\- ]/g, "_") || "prescription";

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": doc.contentType,
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
