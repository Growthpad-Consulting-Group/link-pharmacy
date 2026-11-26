import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { branchSchema } from "@/lib/content/schemas";
import { createBranch, listBranches } from "@/lib/content/store";
import { issuesFrom } from "@/lib/portal/schemas";

export async function GET() {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;
  return NextResponse.json({ branches: await listBranches() });
}

export async function POST(request: Request) {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = branchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }
  const { id, ...input } = parsed.data;
  if (!id) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: { id: ["Enter a short code for the branch"] } }, { status: 422 });
  }

  if (!(await createBranch(id, input))) {
    return NextResponse.json({ error: "A branch with this code already exists", issues: { id: ["This code is already used"] } }, { status: 409 });
  }
  await recordAudit(auth.admin.id, "branch.create", id, input.name);
  return NextResponse.json({ id }, { status: 201 });
}
