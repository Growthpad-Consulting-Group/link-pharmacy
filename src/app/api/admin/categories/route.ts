import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { categorySchema } from "@/lib/content/schemas";
import { createCategory, listManagedCategories } from "@/lib/content/taxonomy";
import { issuesFrom } from "@/lib/portal/schemas";

/** Every blog category with the number of articles in it. */
export async function GET() {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;
  return NextResponse.json({ categories: await listManagedCategories() });
}

export async function POST(request: Request) {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const result = await createCategory(parsed.data.name);
  if (!result.ok) {
    return NextResponse.json({ error: result.message, issues: { name: [result.message] } }, { status: result.status });
  }
  await recordAudit(auth.admin.id, "category.create", parsed.data.name);
  return NextResponse.json({ ok: true }, { status: 201 });
}
