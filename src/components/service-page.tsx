import Link from "next/link";
import { Icon } from "@iconify/react";
import { PageRibbon } from "@/components/page-ribbon";

export type ServicePoint = { title: string; text: string };
export type ServiceAction = { label: string; href: string };

type ServicePageProps = {
  title: string;
  icon: string;
  intro: string;
  points: ServicePoint[];
  /** The first action is the primary button. */
  actions: ServiceAction[];
};

/** Shared layout for the individual Health services pages. */
export function ServicePage({ title, icon, intro, points, actions }: ServicePageProps) {
  return (
    <div className="space-y-16">
      <PageRibbon
        crumbs={[{ label: "Home", href: "/" }, { label: "Health services", href: "/health-services" }, { label: title }]}
        title={title}
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <p className="text-lg leading-relaxed text-ink/80">{intro}</p>

          <section aria-labelledby="expect-heading" className="space-y-6">
            <h2 id="expect-heading" className="text-2xl font-bold text-ink">What to expect</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {points.map((point) => (
                <li key={point.title} className="flex flex-col gap-2 rounded-sm border border-slate-200 bg-white p-6">
                  <h3 className="font-bold text-ink">{point.title}</h3>
                  <p className="text-sm leading-relaxed text-ink/80">{point.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside aria-label="Next steps" className="h-fit space-y-5 rounded-sm bg-[#F7F9F6] p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#F4F8D5]">
            <Icon icon={icon} className="h-5 w-5 text-ink" aria-hidden />
          </span>
          <h2 className="text-xl font-bold text-ink">Ready when you are</h2>
          <div className="flex flex-col gap-3">
            {actions.map((action, i) => (
              <Link
                key={action.href + action.label}
                href={action.href}
                className={
                  i === 0
                    ? "inline-flex items-center justify-between gap-3 rounded-md bg-brand px-5 py-3 font-semibold text-ink transition hover:bg-brand-hover"
                    : "inline-flex items-center justify-between gap-3 rounded-md border border-ink/20 px-5 py-3 font-semibold text-ink transition hover:bg-ink hover:text-white"
                }
              >
                {action.label}
                <Icon icon="lucide:arrow-right" className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <div className="border-t border-slate-200 pt-8">
        <Link href="/health-services" className="inline-flex items-center gap-2 font-semibold text-ink hover:underline underline-offset-4">
          <Icon icon="lucide:arrow-left" className="h-4 w-4" aria-hidden />
          All health services
        </Link>
      </div>
    </div>
  );
}
