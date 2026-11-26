import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { branchSchema } from "@/lib/content/schemas";
import { deleteBranch, getBranch, updateBranch } from "@/lib/content/store";
import { issuesFrom } from "@/lib/portal/schemas";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const branch = await getBranch(id);
  if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  return NextResponse.json({ branch });
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = branchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const { id } = await params;
  const { id: _ignored, ...input } = parsed.data;
  void _ignored;
  if (!(await updateBranch(id, input))) return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  await recordAudit(auth.admin.id, "branch.update", id, input.name);
  return NextResponse.json({ id });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;
  const { id } = await params;
  if (!(await deleteBranch(id))) return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  await recordAudit(auth.admin.id, "branch.delete", id);
  return NextResponse.json({ ok: true });
}
