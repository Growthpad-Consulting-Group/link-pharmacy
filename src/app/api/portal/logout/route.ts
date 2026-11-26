import { NextResponse } from "next/server";
import { PATIENT_SESSION, endSession } from "@/lib/auth/sessions";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  await endSession(response, PATIENT_SESSION);
  return response;
}
