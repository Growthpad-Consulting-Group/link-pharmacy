import { NextResponse } from "next/server";
import { checkPrescriptionFile } from "@/lib/prescription-files";
import { createPrescription } from "@/lib/prescription-service";
import { guestPrescriptionSchema, issuesFrom } from "@/lib/portal/schemas";
import { checkLimits, clientIp, tooManyRequests } from "@/lib/rate-limit";

// Public upload for people without a portal account. Portal patients upload via /api/portal/prescriptions.
export async function POST(request: Request) {
  const limit = await checkLimits([{ key: `guest-upload:ip:${clientIp(request)}`, limit: 20, windowSeconds: 60 * 60 }]);
  if (!limit.allowed) return tooManyRequests(limit);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const parsed = guestPrescriptionSchema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone"),
    notes: String(form.get("notes") ?? ""),
    consent: form.get("consent"),
  });
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

  const { name, email, phone, notes } = parsed.data;
  const reference = await createPrescription({ patientId: null, guest: { name, email, phone }, file, notes });
  return NextResponse.json({ reference });
}
