import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { startSession, PATIENT_SESSION } from "@/lib/auth/sessions";
import { collections } from "@/lib/db/collections";
import { isDuplicateKeyError } from "@/lib/db/mongo";
import { toPatientView, type PatientDoc } from "@/lib/db/models";
import { checkLimits, clientIp, tooManyRequests } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/portal/password";
import { issuesFrom, registerSchema } from "@/lib/portal/schemas";

export async function POST(request: Request) {
  // Creating accounts is limited per address, which slows down bulk sign-ups.
  const limit = await checkLimits([{ key: `patient-register:ip:${clientIp(request)}`, limit: 10, windowSeconds: 60 * 60 }]);
  if (!limit.allowed) return tooManyRequests(limit);

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }
  const input = parsed.data;
  const now = new Date();
  const doc: PatientDoc = {
    _id: randomUUID(),
    name: input.name,
    email: input.email,
    passwordHash: await hashPassword(input.password),
    phone: input.phone,
    dateOfBirth: "",
    address: "",
    medicalAid: "",
    allergies: "",
    emergencyContact: "",
    createdAt: now,
    updatedAt: now,
  };

  const { users } = await collections();
  try {
    // The unique index on email makes this safe even when two registrations arrive at the same time.
    await users.insertOne(doc);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in.", issues: { email: ["This email already has an account"] } },
        { status: 409 },
      );
    }
    throw error;
  }

  const response = NextResponse.json({ patient: toPatientView(doc) }, { status: 201 });
  await startSession(response, PATIENT_SESSION, doc._id);
  return response;
}
