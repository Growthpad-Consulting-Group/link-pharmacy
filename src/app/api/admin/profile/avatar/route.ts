import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin/session";
import { collections } from "@/lib/db/collections";
import { toAdminView } from "@/lib/db/models";
import { checkMediaFile } from "@/lib/media/service";
import { removeAvatar, storeAvatar } from "@/lib/profile/avatar";
import { consumeRateLimit, tooManyRequests } from "@/lib/rate-limit";

// Every signed-in staff member can change their own photo, whatever their role.

/** Uploads or replaces the signed-in staff member's photo. Expects multipart form data with a `file` field. */
export async function PUT(request: Request) {
  const self = await getCurrentAdmin();
  if (!self) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const limit = await consumeRateLimit(`avatar:staff:${self.id}`, 20, 60 * 60);
  if (!limit.allowed) return tooManyRequests(limit);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a photo to upload", issues: { file: ["Choose a photo to upload"] } }, { status: 422 });
  }
  const problem = checkMediaFile(file);
  if (problem) return NextResponse.json({ error: problem, issues: { file: [problem] } }, { status: 422 });

  const { admins } = await collections();
  const current = await admins.findOne({ _id: self.id }, { projection: { avatarUrl: 1 } });

  const stored = await storeAvatar(file, "staff");
  if (!stored.ok) return NextResponse.json({ error: stored.message, issues: { file: [stored.message] } }, { status: stored.status });

  await admins.updateOne({ _id: self.id }, { $set: { avatarUrl: stored.image.url, updatedAt: new Date() } });
  await removeAvatar(current?.avatarUrl);

  const doc = await admins.findOne({ _id: self.id }, { projection: { passwordHash: 0 } });
  return NextResponse.json({ admin: doc ? toAdminView(doc) : null });
}

/** Removes the signed-in staff member's photo, leaving the initials. */
export async function DELETE() {
  const self = await getCurrentAdmin();
  if (!self) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { admins } = await collections();
  const current = await admins.findOne({ _id: self.id }, { projection: { avatarUrl: 1 } });

  await admins.updateOne({ _id: self.id }, { $unset: { avatarUrl: "" }, $set: { updatedAt: new Date() } });
  await removeAvatar(current?.avatarUrl);

  const doc = await admins.findOne({ _id: self.id }, { projection: { passwordHash: 0 } });
  return NextResponse.json({ admin: doc ? toAdminView(doc) : null });
}
