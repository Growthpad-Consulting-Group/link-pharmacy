import { NextResponse } from "next/server";
import { collections } from "@/lib/db/collections";
import { toPrescriptionView } from "@/lib/db/models";
import { createPrescription } from "@/lib/prescription-service";
import { checkPrescriptionFile } from "@/lib/prescription-files";
import { checkLimits, tooManyRequests } from "@/lib/rate-limit";
import { issuesFrom, portalPrescriptionSchema } from "@/lib/portal/schemas";
import { getSessionUserId } from "@/lib/portal/session";

/** Lists the signed-in patient's prescriptions, newest first. Only their own records are ever returned. */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { prescriptions } = await collections();
  const docs = await prescriptions.find({ patientId: userId }).sort({ createdAt: -1 }).limit(100).toArray();
  return NextResponse.json({ prescriptions: docs.map(toPrescriptionView) });
}

/** Uploads a prescription for the signed-in patient. Their identity comes from the session, not the form. */
export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in to upload a prescription" }, { status: 401 });

  const limit = await checkLimits([{ key: `portal-upload:user:${userId}`, limit: 30, windowSeconds: 60 * 60 }]);
  if (!limit.allowed) return tooManyRequests(limit);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const parsed = portalPrescriptionSchema.safeParse({ notes: String(form.get("notes") ?? ""), consent: form.get("consent") });
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const file = form.get("prescription");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Please choose your prescription file", issues: { prescription: ["Choose a file"] } }, { status: 422 });
  }
  const problem = checkPrescriptionFile(file);
  if (problem) {
    return NextResponse.json({ error: "The file cannot be uploaded", issues: { prescription: [problem] } }, { status: 422 });
  }

  const reference = await createPrescription({ patientId: userId, guest: null, file, notes: parsed.data.notes });
  return NextResponse.json({ prescription: { reference } }, { status: 201 });
}
