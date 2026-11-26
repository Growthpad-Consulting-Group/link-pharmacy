import Link from "next/link";
import { Icon } from "@iconify/react";
import { PageRibbon } from "@/components/page-ribbon";
import { formatArticleDate } from "@/lib/articles";
import { listPublishedArticles } from "@/lib/content/store";
import { normaliseTag } from "@/lib/content/names";
import { listCategories } from "@/lib/content/taxonomy";

export const metadata = { title: "Health blog" };

type SearchParams = Promise<{ category?: string; tag?: string }>;

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, tag } = await searchParams;
  const [categories, published] = await Promise.all([listCategories(), listPublishedArticles()]);

  const activeCategory = categories.find((c) => c.name === category);
  const activeTag = tag ? normaliseTag(tag) : undefined;
  const articles = published.filter(
    (a) => (!activeCategory || a.category === activeCategory.name) && (!activeTag || a.tags.includes(activeTag)),
  );
  const allTags = [...new Set(published.flatMap((a) => a.tags))].sort();

  return (
    <div className="space-y-10">
      <PageRibbon crumbs={[{ label: "Home", href: "/" }, { label: "Health blog" }]} title="Health blog" />

      <p className="max-w-2xl text-lg leading-relaxed text-ink/80">
        Clear, practical health information from our pharmacists and clinicians. Learn more about your medicines, your
        body and everyday wellbeing.
      </p>

      <nav aria-label="Blog categories" className="flex flex-wrap gap-2">
        <Link
          href={activeTag ? `/blog?tag=${encodeURIComponent(activeTag)}` : "/blog"}
          className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition ${!activeCategory ? "bg-ink text-white" : "border border-slate-300 bg-white text-ink hover:bg-slate-100"}`}
        >
          All topics
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/blog?category=${encodeURIComponent(c.name)}${activeTag ? `&tag=${encodeURIComponent(activeTag)}` : ""}`}
            className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition ${activeCategory?.id === c.id ? "bg-ink text-white" : "border border-slate-300 bg-white text-ink hover:bg-slate-100"}`}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      {allTags.length > 0 && (
        <nav aria-label="Blog tags" className="flex flex-wrap items-center gap-2 text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-muted">
            <Icon icon="lucide:tags" className="h-4 w-4" aria-hidden />
            Tags:
          </span>
          {allTags.map((t) => (
            <Link
              key={t}
              href={`/blog?tag=${encodeURIComponent(t)}${activeCategory ? `&category=${encodeURIComponent(activeCategory.name)}` : ""}`}
              aria-current={activeTag === t ? "page" : undefined}
              className={`rounded-full px-3 py-1 transition ${activeTag === t ? "bg-brand text-ink" : "bg-slate-100 text-ink hover:bg-slate-200"}`}
            >
              #{t}
            </Link>
          ))}
          {activeTag && (
            <Link href={activeCategory ? `/blog?category=${encodeURIComponent(activeCategory.name)}` : "/blog"} className="font-semibold text-ink underline">
              Clear tag
            </Link>
          )}
        </nav>
      )}

      {articles.length === 0 ? (
        <p className="rounded-sm border border-dashed border-slate-300 py-14 text-center text-muted">No articles match this selection yet.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/blog/${a.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-sm border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-[#F7F9F6] p-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image} alt="" loading="lazy" className="h-full w-full object-contain" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    <span className="rounded-md bg-[#F4F8D5] px-2 py-1 text-ink">{a.category}</span>
                    <span>{a.readTime}</span>
                  </div>
                  <h2 className="text-lg font-bold leading-snug text-ink">{a.title}</h2>
                  <p className="text-sm text-muted">{a.excerpt}</p>
                  <span className="mt-auto flex items-center justify-between gap-2 border-t border-slate-200 pt-4 text-sm font-semibold text-ink">
                    {formatArticleDate(a.date)}
                    <Icon icon="lucide:arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
