import { ArticleEditor } from "@/components/admin/article-editor";

export default async function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArticleEditor slug={slug} />;
}
