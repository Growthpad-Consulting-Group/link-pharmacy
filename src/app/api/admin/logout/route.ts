import { NextResponse } from "next/server";
import { ADMIN_SESSION, endSession } from "@/lib/auth/sessions";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  await endSession(response, ADMIN_SESSION);
  return response;
}
