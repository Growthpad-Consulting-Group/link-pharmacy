"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import type { ManagedArticle } from "@/lib/content/store";
import { Alert, Panel, Tag } from "./format";
import { apiFetch, errorMessage } from "./api";
import { TableSkeleton } from "./loading";

export function ArticlesList() {
  const [articles, setArticles] = useState<ManagedArticle[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ articles: ManagedArticle[] }>("/api/admin/articles")
      .then((result) => {
        if (!cancelled) setArticles(result.articles);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Health blog</h1>
          <p className="text-sm text-muted">Articles on the public blog. Drafts are saved but not shown to visitors.</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 self-start rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/85"
        >
          <Icon icon="lucide:plus" className="h-4 w-4 text-brand" aria-hidden />
          New article
        </Link>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Panel>
        {!articles && !error && <TableSkeleton rows={5} />}
        {articles && articles.length === 0 && <p className="py-8 text-center text-muted">No articles yet.</p>}
        {articles && articles.length > 0 && (
          <ul className="divide-y divide-slate-200">
            {articles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/admin/articles/${encodeURIComponent(article.slug)}`}
                  className="flex flex-col gap-2 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-2"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{article.title}</p>
                    <p className="truncate text-sm text-muted">
                      {article.category} · {article.date} · /blog/{article.slug}
                    </p>
                  </div>
                  <Tag tone={article.published ? "emerald" : "amber"}>{article.published ? "Published" : "Draft"}</Tag>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
