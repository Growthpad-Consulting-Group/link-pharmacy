import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/portal/session";
import { collections } from "@/lib/db/collections";
import { toPatientView } from "@/lib/db/models";
import { issuesFrom, profileSchema } from "@/lib/portal/schemas";

/** Updates the signed-in patient's details. The email address is the login and cannot be changed here. */
export async function PUT(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const { users } = await collections();
  const result = await users.updateOne({ _id: userId }, { $set: { ...parsed.data, updatedAt: new Date() } });
  if (result.matchedCount === 0) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const doc = await users.findOne({ _id: userId }, { projection: { passwordHash: 0 } });
  return NextResponse.json({ patient: doc ? toPatientView(doc) : null });
}
