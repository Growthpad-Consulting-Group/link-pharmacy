import "server-only";
import { storeImage } from "@/lib/media/service";
import { deletePublicObject, objectKeyFromUrl } from "@/lib/storage/r2";

export type AvatarOwner = "patients" | "staff";

/** Stores a profile photo in its own folder in R2. Returns the new address. */
export async function storeAvatar(file: File, owner: AvatarOwner) {
  return storeImage(file, `avatars/${owner}`);
}

/**
 * Removes a previous profile photo from R2. Only files in the avatars folder are deleted, so a
 * stored address can never cause a blog image or anything else to be removed.
 */
export async function removeAvatar(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const key = objectKeyFromUrl(url);
  if (key?.startsWith("avatars/")) {
    await deletePublicObject(key).catch(() => undefined);
  }
}
