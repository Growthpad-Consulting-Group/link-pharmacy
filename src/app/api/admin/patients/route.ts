import { NextResponse } from "next/server";
import { authorize } from "@/lib/admin/session";
import { recordAudit } from "@/lib/admin/audit";
import { PAGE_SIZE, pageFrom, searchPattern } from "@/lib/admin/views";
import { collections } from "@/lib/db/collections";
import { toPatientView, type PatientDoc } from "@/lib/db/models";
import type { Filter } from "mongodb";

/** Searches patients by name, email or phone. Each search is recorded in the audit log. */
export async function GET(request: Request) {
  const auth = await authorize("patients:read");
  if ("response" in auth) return auth.response;
  const { admin } = auth;

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const page = pageFrom(url);
  const filter: Filter<PatientDoc> = q
    ? { $or: [{ name: searchPattern(q) }, { email: searchPattern(q) }, { phone: searchPattern(q) }] }
    : {};

  const { users } = await collections();
  const [docs, total] = await Promise.all([
    users.find(filter, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).toArray(),
    users.countDocuments(filter),
  ]);

  await recordAudit(admin.id, "patients.search", "patients", q);
  return NextResponse.json({ patients: docs.map(toPatientView), total, page, pageSize: PAGE_SIZE });
}
