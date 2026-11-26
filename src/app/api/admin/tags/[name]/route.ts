import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { tagSchema } from "@/lib/content/schemas";
import { deleteTag, renameTag } from "@/lib/content/taxonomy";
import { issuesFrom } from "@/lib/portal/schemas";

type Params = { params: Promise<{ name: string }> };

/** Renames a tag on every article. Renaming to an existing tag merges the two. */
export async function PATCH(request: Request, { params }: Params) {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = tagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const { name } = await params;
  const result = await renameTag(name, parsed.data.name);
  if (!result.ok) {
    return NextResponse.json({ error: result.message, issues: { name: [result.message] } }, { status: result.status });
  }
  await recordAudit(auth.admin.id, "tag.rename", name, parsed.data.name);
  return NextResponse.json({ ok: true });
}

/** Removes a tag from every article. */
export async function DELETE(_request: Request, { params }: Params) {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;

  const { name } = await params;
  const result = await deleteTag(name);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
  await recordAudit(auth.admin.id, "tag.delete", name);
  return NextResponse.json({ ok: true });
}
