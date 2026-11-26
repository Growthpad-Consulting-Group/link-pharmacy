import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { issuesFrom } from "@/lib/portal/schemas";
import { articleSchema } from "@/lib/content/schemas";
import { createArticle, listAllArticles } from "@/lib/content/store";
import { categoryExists } from "@/lib/content/taxonomy";

/** Every article, including drafts. */
export async function GET() {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;
  return NextResponse.json({ articles: await listAllArticles() });
}

export async function POST(request: Request) {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = articleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: issuesFrom(parsed.error) }, { status: 422 });
  }
  const { slug, ...input } = parsed.data;
  if (!slug) {
    return NextResponse.json({ error: "Please check the highlighted fields", issues: { slug: ["Enter a web address for the article"] } }, { status: 422 });
  }

  if (!(await categoryExists(input.category))) {
    return NextResponse.json({ error: "Choose a category from the list", issues: { category: ["Choose a category from the list"] } }, { status: 422 });
  }

  const created = await createArticle(slug, input);
  if (!created) {
    return NextResponse.json({ error: "An article with this web address already exists", issues: { slug: ["This address is already used"] } }, { status: 409 });
  }
  await recordAudit(auth.admin.id, "article.create", slug, input.title);
  return NextResponse.json({ slug }, { status: 201 });
}
