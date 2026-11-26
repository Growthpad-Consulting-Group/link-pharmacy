import "server-only";
import { randomUUID } from "node:crypto";
import { collections } from "@/lib/db/collections";
import type { Guest } from "@/lib/db/models";
import { notify } from "@/lib/notifications/service";
import { deletePrescriptionFile, storePrescriptionFile } from "@/lib/prescription-files";

/** Saves a prescription file and its record. Returns the reference the patient quotes. */
export async function createPrescription(input: {
  patientId: string | null;
  guest: Guest | null;
  file: File;
  notes: string;
}): Promise<string> {
  const reference = `RX-${randomUUID().slice(0, 8).toUpperCase()}`;
  const fileId = await storePrescriptionFile(input.file);
  const now = new Date();
  const { prescriptions } = await collections();

  try {
    await prescriptions.insertOne({
      _id: randomUUID(),
      reference,
      patientId: input.patientId,
      guest: input.guest,
      fileId,
      originalName: input.file.name.slice(0, 200),
      contentType: input.file.type,
      size: input.file.size,
      notes: input.notes,
      status: "received",
      statusHistory: [{ status: "received", note: "", by: "system", at: now }],
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    // Do not leave an orphaned file behind when the record could not be saved.
    await deletePrescriptionFile(fileId);
    throw error;
  }
  await notify({
    type: "prescription",
    title: `New prescription ${reference}`,
    body: input.guest ? `From ${input.guest.name} (guest upload)` : "Uploaded by a registered patient",
    href: `/admin/prescriptions/${reference}`,
    permission: "prescriptions:read",
  });
  return reference;
}
