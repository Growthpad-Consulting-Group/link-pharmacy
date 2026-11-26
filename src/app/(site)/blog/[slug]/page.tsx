import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@iconify/react";
import { PageRibbon } from "@/components/page-ribbon";
import { formatArticleDate } from "@/lib/articles";
import { getPublishedArticle, listPublishedArticles } from "@/lib/content/store";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  return { title: article?.title ?? "Article not found" };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) notFound();

  const related = (await listPublishedArticles())
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, 3);

  return (
    <div className="space-y-12">
      <PageRibbon
        crumbs={[{ label: "Home", href: "/" }, { label: "Health blog", href: "/blog" }, { label: article.category, href: `/blog?category=${encodeURIComponent(article.category)}` }]}
        title={article.title}
      />

      <article className="mx-auto max-w-3xl space-y-8">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="rounded-md bg-[#F4F8D5] px-2 py-1 text-xs font-semibold uppercase tracking-wide text-ink">{article.category}</span>
          <span>{formatArticleDate(article.date)}</span>
          <span aria-hidden>·</span>
          <span>{article.readTime}</span>
        </div>

        <p className="text-xl leading-relaxed text-ink/80">{article.excerpt}</p>

        <div className="flex aspect-[16/9] items-center justify-center rounded-sm bg-[#F7F9F6] p-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.image} alt="" className="h-full w-full object-contain" />
        </div>

        {/* The HTML is written by the admin editor and sanitized on save and again on read. */}
        <div className="rich-text text-lg leading-relaxed text-ink/85" dangerouslySetInnerHTML={{ __html: article.html }} />

        {article.tags.length > 0 && (
          <ul aria-label="Article tags" className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <li key={tag}>
                <Link href={`/blog?tag=${encodeURIComponent(tag)}`} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-ink hover:bg-slate-200">
                  <Icon icon="lucide:tag" className="h-3.5 w-3.5" aria-hidden />
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <aside className="flex gap-4 rounded-sm bg-[#F7F9F6] p-5 text-sm text-muted">
          <Icon icon="lucide:info" className="mt-0.5 h-5 w-5 shrink-0 text-ink" aria-hidden />
          <p>
            This article is general educational information and does not replace advice from a doctor or pharmacist. For
            questions about your own health, <Link href="/customer-care" className="font-semibold text-ink underline">contact customer care</Link>.
          </p>
        </aside>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-articles" className="space-y-6">
          <h2 id="related-articles" className="text-2xl font-bold text-ink">More on {article.category}</h2>
          <ul className="grid gap-6 md:grid-cols-3">
            {related.map((a) => (
              <li key={a.slug}>
                <Link href={`/blog/${a.slug}`} className="group flex h-full flex-col gap-2 rounded-sm border border-slate-200 bg-white p-5 transition hover:border-brand hover:shadow-md">
                  <h3 className="font-bold leading-snug text-ink">{a.title}</h3>
                  <p className="text-sm text-muted">{a.readTime}</p>
                  <span className="mt-auto flex items-center gap-2 pt-3 text-sm font-semibold text-ink">
                    Read article
                    <Icon icon="lucide:arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
