import { PageRibbon } from "@/components/page-ribbon";

export type LegalSection = { heading: string; body: string[] };

/** Shared layout for policy pages: ribbon header, last-updated date, and numbered sections. */
export function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return (
    <div className="space-y-10">
      <PageRibbon crumbs={[{ label: "Home", href: "/" }, { label: title }]} title={title} />

      <article className="mx-auto max-w-3xl space-y-10">
        <div className="space-y-3">
          <p className="text-sm text-muted">Last updated: 9 November 2026</p>
          <p className="text-lg leading-relaxed text-ink">{intro}</p>
        </div>

        {sections.map((section, i) => (
          <section key={section.heading} aria-labelledby={`section-${i}`} className="space-y-3">
            <h2 id={`section-${i}`} className="flex items-baseline gap-3 text-xl font-bold text-ink">
              <span className="text-sm font-semibold text-muted">{i + 1}.</span>
              {section.heading}
            </h2>
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="leading-relaxed text-ink/80">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <p className="rounded-sm bg-[#F7F9F6] p-5 text-sm text-muted">
          Questions about this document? Contact us through the Help &amp; contact page, or write to Link Pharmacy Ltd.
        </p>
      </article>
    </div>
  );
}
