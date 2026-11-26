import Link from "next/link";
import { Icon } from "@iconify/react";
import { PageRibbon } from "@/components/page-ribbon";

export const metadata = { title: "Health services" };

// Pharmacy health services. Descriptions are general wording to review before launch.
const SERVICES = [
  {
    icon: "lucide:message-circle",
    title: "Pharmacist consultation",
    text: "Talk to a pharmacist about your medicines, symptoms or a new prescription. Ask about side effects and how to take your medicine safely.",
    cta: { label: "Ask a pharmacist", href: "/customer-care" },
  },
  {
    icon: "lucide:syringe",
    title: "Vaccinations",
    text: "Routine and seasonal vaccinations for adults and children, including flu. Ask us which vaccines are due and what to expect.",
    cta: { label: "Find a branch", href: "/find-a-pharmacy" },
  },
  {
    icon: "lucide:heart-pulse",
    title: "Blood pressure checks",
    text: "A quick, private blood pressure reading, with advice on what the numbers mean and when to see a doctor.",
    cta: { label: "Read the guide", href: "/blog/understanding-blood-pressure-numbers" },
  },
  {
    icon: "lucide:clipboard-check",
    title: "Health checks",
    text: "Simple screening checks for everyday health, including blood sugar and weight, with advice on next steps.",
    cta: { label: "Book a health check", href: "/mediclinic#appointment" },
  },
  {
    icon: "lucide:pill",
    title: "Medication review",
    text: "If you take several medicines, we can review them together to check for interactions and make sure they still suit you.",
    cta: { label: "Ask a pharmacist", href: "/customer-care" },
  },
];

const STEPS = [
  { title: "Choose a service", text: "Pick the service you need from the list below." },
  { title: "Book or walk in", text: "Book an appointment online, or visit a branch when it suits you." },
  { title: "Get advice you can use", text: "Leave with clear, practical advice and a plan for next steps." },
];

export default function HealthServicesPage() {
  return (
    <div className="space-y-16">
      <PageRibbon crumbs={[{ label: "Home", href: "/" }, { label: "Health services" }]} title="Health services" />

      <p className="max-w-2xl text-lg leading-relaxed text-ink/80">
        Our pharmacists offer friendly, private health services to help you stay well, manage your medicines and get the
        right advice quickly.
      </p>

      <section aria-labelledby="services-heading" className="space-y-6">
        <h2 id="services-heading" className="text-2xl font-bold text-ink">Our services</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <li key={s.title} className="flex flex-col gap-4 rounded-sm border border-slate-200 bg-white p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#F4F8D5]">
                <Icon icon={s.icon} className="h-5 w-5 text-ink" aria-hidden />
              </span>
              <h3 className="text-lg font-bold text-ink">{s.title}</h3>
              <p className="text-sm leading-relaxed text-ink/80">{s.text}</p>
              <Link href={s.cta.href} className="mt-auto inline-flex items-center gap-2 border-t border-slate-200 pt-4 text-sm font-semibold text-ink hover:underline">
                {s.cta.label}
                <Icon icon="lucide:arrow-right" className="h-4 w-4" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-heading" className="space-y-6 rounded-sm bg-[#F7F9F6] p-6 sm:p-10">
        <h2 id="how-heading" className="text-2xl font-bold text-ink">How it works</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink text-sm font-bold text-white">{i + 1}</span>
              <div>
                <p className="font-bold text-ink">{step.title}</p>
                <p className="mt-1 text-sm text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="cta-heading" className="flex flex-col items-start gap-5 rounded-sm bg-ink p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="space-y-2">
          <h2 id="cta-heading" className="text-2xl font-bold">Need advice today?</h2>
          <p className="text-white/75">Speak to a pharmacist, or find the branch nearest you.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/find-a-pharmacy" className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-3 font-semibold text-ink transition hover:bg-brand-hover">
            Find a pharmacy
            <Icon icon="lucide:arrow-right" className="h-4 w-4" aria-hidden />
          </Link>
          <Link href="/mediclinic#appointment" className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
            Book with Mediclinic
          </Link>
        </div>
      </section>
    </div>
  );
}
