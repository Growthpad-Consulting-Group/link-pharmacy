import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { tagSchema } from "@/lib/content/schemas";
import { createTag, listManagedTags } from "@/lib/content/taxonomy";
import { issuesFrom } from "@/lib/portal/schemas";

/** Every tag with the number of articles that use it. */
export async function GET() {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;
  return NextResponse.json({ tags: await listManagedTags() });
}

export async function POST(request: Request) {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = tagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const result = await createTag(parsed.data.name);
  if (!result.ok) {
    return NextResponse.json({ error: result.message, issues: { name: [result.message] } }, { status: result.status });
  }
  await recordAudit(auth.admin.id, "tag.create", parsed.data.name);
  return NextResponse.json({ ok: true }, { status: 201 });
}
