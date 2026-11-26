import { NextResponse } from "next/server";
import { collections } from "@/lib/db/collections";
import { toPatientView } from "@/lib/db/models";
import { consumeRateLimit, tooManyRequests } from "@/lib/rate-limit";
import { checkMediaFile } from "@/lib/media/service";
import { removeAvatar, storeAvatar } from "@/lib/profile/avatar";
import { getSessionUserId } from "@/lib/portal/session";

/** Uploads or replaces the signed-in patient's profile photo. Expects multipart form data with a `file` field. */
export async function PUT(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const limit = await consumeRateLimit(`avatar:patient:${userId}`, 20, 60 * 60);
  if (!limit.allowed) return tooManyRequests(limit);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a photo to upload", issues: { file: ["Choose a photo to upload"] } }, { status: 422 });
  }
  const problem = checkMediaFile(file);
  if (problem) return NextResponse.json({ error: problem, issues: { file: [problem] } }, { status: 422 });

  const { users } = await collections();
  const current = await users.findOne({ _id: userId }, { projection: { avatarUrl: 1 } });
  if (!current) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const stored = await storeAvatar(file, "patients");
  if (!stored.ok) return NextResponse.json({ error: stored.message, issues: { file: [stored.message] } }, { status: stored.status });

  await users.updateOne({ _id: userId }, { $set: { avatarUrl: stored.image.url, updatedAt: new Date() } });
  await removeAvatar(current.avatarUrl);

  const doc = await users.findOne({ _id: userId }, { projection: { passwordHash: 0 } });
  return NextResponse.json({ patient: doc ? toPatientView(doc) : null });
}

/** Removes the signed-in patient's profile photo, leaving the initials. */
export async function DELETE() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { users } = await collections();
  const current = await users.findOne({ _id: userId }, { projection: { avatarUrl: 1 } });
  if (!current) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  await users.updateOne({ _id: userId }, { $unset: { avatarUrl: "" }, $set: { updatedAt: new Date() } });
  await removeAvatar(current.avatarUrl);

  const doc = await users.findOne({ _id: userId }, { projection: { passwordHash: 0 } });
  return NextResponse.json({ patient: doc ? toPatientView(doc) : null });
}
