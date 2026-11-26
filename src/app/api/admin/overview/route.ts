import { NextResponse } from "next/server";
import { authorize } from "@/lib/admin/session";
import { getOverview } from "@/lib/admin/overview";

/** Headline numbers for the admin overview. Each section is only included for roles allowed to see it. */
export async function GET() {
  const auth = await authorize("prescriptions:read");
  if ("response" in auth) return auth.response;
  return NextResponse.json(await getOverview(auth.admin));
}
