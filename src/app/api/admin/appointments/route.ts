import { NextResponse } from "next/server";
import type { Filter } from "mongodb";
import { authorize } from "@/lib/admin/session";
import { PAGE_SIZE, pageFrom } from "@/lib/admin/views";
import { collections } from "@/lib/db/collections";
import { APPOINTMENT_STATUSES, type AppointmentDoc, type AppointmentStatus } from "@/lib/db/models";

/** Appointment requests, newest first. Filter with ?status=new. */
export async function GET(request: Request) {
  const auth = await authorize("messages:read");
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const filter: Filter<AppointmentDoc> = {};
  if (status) {
    if (!(APPOINTMENT_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: "Unknown status" }, { status: 422 });
    }
    filter.status = status as AppointmentStatus;
  }

  const { appointments } = await collections();
  const page = pageFrom(url);
  const [docs, total] = await Promise.all([
    appointments.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).toArray(),
    appointments.countDocuments(filter),
  ]);

  return NextResponse.json({
    appointments: docs.map((doc) => ({
      id: doc._id,
      reference: doc.reference,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      message: doc.message,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
  });
}
