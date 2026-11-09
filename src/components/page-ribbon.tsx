import Link from "next/link";
import { Icon } from "@iconify/react";

/** Full-width ribbon header with breadcrumb and title, matching the shop page. */
export function PageRibbon({ crumbs, title }: { crumbs: { label: string; href?: string }[]; title: string }) {
  return (
    <header className="relative -mt-10 left-1/2 w-screen -translate-x-1/2 bg-[#F4F8D5]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:px-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center gap-1.5">
              {i > 0 && <Icon icon="lucide:chevron-right" className="h-3.5 w-3.5" aria-hidden />}
              {c.href ? (
                <Link href={c.href} className="hover:text-ink hover:underline">{c.label}</Link>
              ) : (
                <span className="font-medium text-ink">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/plus-medical.svg" alt="" aria-hidden className="h-8 w-8 shrink-0" />
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
      </div>
    </header>
  );
}
