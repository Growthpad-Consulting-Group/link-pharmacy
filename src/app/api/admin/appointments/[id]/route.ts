import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { appointmentStatusSchema } from "@/lib/content/schemas";
import { collections } from "@/lib/db/collections";
import { issuesFrom } from "@/lib/portal/schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize("messages:manage");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = appointmentStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const { id } = await params;
  const { appointments } = await collections();
  const result = await appointments.updateOne({ _id: id }, { $set: { status: parsed.data.status, updatedAt: new Date() } });
  if (result.matchedCount === 0) return NextResponse.json({ error: "Appointment request not found" }, { status: 404 });

  await recordAudit(auth.admin.id, "appointment.status", id, parsed.data.status);
  return NextResponse.json({ id, status: parsed.data.status });
}
