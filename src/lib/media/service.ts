import "server-only";
import { randomUUID } from "node:crypto";
import { collections } from "@/lib/db/collections";
import type { MediaDoc } from "@/lib/db/models";
import { isObjectStorageConfigured, putPublicObject } from "@/lib/storage/r2";
import type { MediaItem } from "./types";

export const MEDIA_MAX_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Returns a message for the uploader if the file is not acceptable, otherwise null. */
export function checkMediaFile(file: File): string | null {
  if (file.size === 0) return "Choose an image to upload";
  if (!(file.type in EXTENSIONS)) return "Upload a JPG, PNG, WebP or GIF image";
  if (file.size > MEDIA_MAX_BYTES) return "Images must be 5 MB or smaller";
  return null;
}

/** Checks the file's signature bytes so a renamed non-image cannot be stored as an image. */
function matchesType(bytes: Buffer, type: string): boolean {
  switch (type) {
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "image/gif":
      return bytes.subarray(0, 3).toString("ascii") === "GIF";
    case "image/webp":
      return bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
    default:
      return false;
  }
}

export type StoredImage = { url: string; key: string; size: number; contentType: string };
export type StoreResult = { ok: true; image: StoredImage } | { ok: false; status: number; message: string };

/**
 * Checks an image and stores it in R2 under `folder` with a random file name. Used by the blog media
 * library, patient photos and staff photos.
 */
export async function storeImage(file: File, folder: string): Promise<StoreResult> {
  if (!isObjectStorageConfigured()) {
    return { ok: false, status: 503, message: "Image storage is not set up yet. Add the R2 settings to the server configuration." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!matchesType(bytes, file.type)) {
    return { ok: false, status: 422, message: "This file is not a valid image of the type it claims to be" };
  }

  const key = `${folder}/${randomUUID()}.${EXTENSIONS[file.type]}`;
  const url = await putPublicObject(key, bytes, file.type);
  return { ok: true, image: { url, key, size: bytes.length, contentType: file.type } };
}

export type UploadResult = { ok: true; item: MediaItem } | { ok: false; status: number; message: string };

/** Stores an image for the blog and records it in the media library. */
export async function uploadMedia(file: File, adminId: string): Promise<UploadResult> {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const stored = await storeImage(file, `media/${now.getUTCFullYear()}/${month}`);
  if (!stored.ok) return stored;

  const originalName = file.name.replace(/[^\w.\- ]+/g, "").slice(0, 200) || "image";
  const doc: MediaDoc = {
    _id: stored.image.key,
    url: stored.image.url,
    originalName,
    contentType: stored.image.contentType,
    size: stored.image.size,
    uploadedBy: adminId,
    createdAt: now,
  };
  const { media } = await collections();
  await media.insertOne(doc);

  return { ok: true, item: toMediaItem(doc) };
}

/** Most recent uploads first. */
export async function listMedia(limit = 60): Promise<MediaItem[]> {
  const { media } = await collections();
  const docs = await media.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  return docs.map(toMediaItem);
}

function toMediaItem(doc: MediaDoc): MediaItem {
  return {
    id: doc._id,
    url: doc.url,
    originalName: doc.originalName,
    contentType: doc.contentType,
    size: doc.size,
    createdAt: doc.createdAt.toISOString(),
  };
}
