import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { articleSchema } from "@/lib/content/schemas";
import { deleteArticle, getArticleForEdit, updateArticle } from "@/lib/content/store";
import { categoryExists } from "@/lib/content/taxonomy";
import { issuesFrom } from "@/lib/portal/schemas";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;
  const { slug } = await params;
  const article = await getArticleForEdit(slug);
  if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  return NextResponse.json({ article });
}

/** Updates an article. Its web address (slug) never changes, so existing links keep working. */
export async function PUT(request: Request, { params }: Params) {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = articleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }

  const { slug } = await params;
  const { slug: _ignored, ...input } = parsed.data;
  void _ignored;
  if (!(await categoryExists(input.category))) {
    return NextResponse.json({ error: "Choose a category from the list", issues: { category: ["Choose a category from the list"] } }, { status: 422 });
  }
  if (!(await updateArticle(slug, input))) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  await recordAudit(auth.admin.id, "article.update", slug, input.published ? "published" : "draft");
  return NextResponse.json({ slug });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;
  const { slug } = await params;
  if (!(await deleteArticle(slug))) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  await recordAudit(auth.admin.id, "article.delete", slug);
  return NextResponse.json({ ok: true });
}
