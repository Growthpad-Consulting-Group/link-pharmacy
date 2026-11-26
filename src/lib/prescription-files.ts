import "server-only";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ObjectId } from "mongodb";
import { prescriptionBucket } from "@/lib/db/collections";

export const PRESCRIPTION_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);

/** Returns a message for the uploader if the file is not acceptable, otherwise null. */
export function checkPrescriptionFile(file: File): string | null {
  if (file.size === 0) return "Choose your prescription file";
  if (!ALLOWED_TYPES.has(file.type)) return "Upload a JPG, PNG or PDF";
  if (file.size > PRESCRIPTION_MAX_BYTES) return "Files must be 10 MB or smaller";
  return null;
}

/** Stores the file in GridFS (MongoDB) and returns its id. */
export async function storePrescriptionFile(file: File): Promise<ObjectId> {
  const bucket = await prescriptionBucket();
  const upload = bucket.openUploadStream(file.name.slice(0, 200), { metadata: { contentType: file.type } });
  await pipeline(Readable.from([Buffer.from(await file.arrayBuffer())]), upload);
  return upload.id;
}

export async function readPrescriptionFile(fileId: ObjectId): Promise<Buffer> {
  const bucket = await prescriptionBucket();
  const chunks: Buffer[] = [];
  for await (const chunk of bucket.openDownloadStream(fileId)) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function deletePrescriptionFile(fileId: ObjectId): Promise<void> {
  const bucket = await prescriptionBucket();
  await bucket.delete(fileId).catch(() => undefined);
}
