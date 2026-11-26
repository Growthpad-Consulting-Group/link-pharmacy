import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { categorySchema } from "@/lib/content/schemas";
import { deleteCategory, renameCategory } from "@/lib/content/taxonomy";
import { issuesFrom } from "@/lib/portal/schemas";

type Params = { params: Promise<{ id: string }> };

/** Renames a category. Articles in it move to the new name automatically. */
export async function PATCH(request: Request, { params }: Params) {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const { id } = await params;
  const result = await renameCategory(id, parsed.data.name);
  if (!result.ok) {
    return NextResponse.json({ error: result.message, issues: { name: [result.message] } }, { status: result.status });
  }
  await recordAudit(auth.admin.id, "category.rename", id, parsed.data.name);
  return NextResponse.json({ ok: true });
}

/** Deletes a category. Refused while articles still use it. */
export async function DELETE(_request: Request, { params }: Params) {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const result = await deleteCategory(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
  await recordAudit(auth.admin.id, "category.delete", id);
  return NextResponse.json({ ok: true });
}
