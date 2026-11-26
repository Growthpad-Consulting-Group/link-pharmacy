import Link from "next/link";
import { Icon } from "@iconify/react";
import { PageRibbon } from "@/components/page-ribbon";
import { listBranches } from "@/lib/content/store";

export const metadata = { title: "About us" };

// Sample content for the About page. Replace the history, team, departments and events with your real information.
const VALUES = [
  { icon: "lucide:heart-handshake", title: "Care first", text: "Every decision starts with what is best for the person in front of us." },
  { icon: "lucide:shield-check", title: "Trusted advice", text: "Our pharmacists are qualified, accessible and honest about what they know." },
  { icon: "lucide:sprout", title: "Everyday wellness", text: "Practical products and services for the routines that keep people healthy." },
];

const HISTORY = [
  { year: "2012", title: "First Link Pharmacy opens", text: "We open our first branch with a simple promise: friendly, expert care close to home." },
  { year: "2016", title: "Link Mediclinic launches", text: "Clinic consultations and health checks join the pharmacy under one roof." },
  { year: "2020", title: "Online ordering goes live", text: "Customers can shop, upload prescriptions and collect from their nearest branch." },
  { year: "2024", title: "Three branches, one team", text: "Central, North and Riverside now share stock, pharmacists and patient records." },
];

const MANAGEMENT = [
  { name: "Full name", role: "Chief Executive Officer", initials: "CE", text: "Leads the company strategy and our commitment to patient care." },
  { name: "Full name", role: "Head of Pharmacy", initials: "HP", text: "Oversees clinical standards, prescriptions and pharmacist teams." },
  { name: "Full name", role: "Chief Operating Officer", initials: "OP", text: "Runs branch operations, stock and delivery across all locations." },
  { name: "Full name", role: "Head of Clinic", initials: "HC", text: "Leads Link Mediclinic services, appointments and patient experience." },
];

const DEPARTMENTS = [
  { icon: "lucide:pill", title: "Pharmacy", text: "Dispensing, prescriptions and medicine advice." },
  { icon: "lucide:stethoscope", title: "Clinic", text: "Consultations, health checks and vaccinations." },
  { icon: "lucide:package", title: "Retail & wellness", text: "Vitamins, personal care, baby and beauty products." },
  { icon: "lucide:truck", title: "Delivery & logistics", text: "Stock, dispatch and home delivery." },
  { icon: "lucide:headset", title: "Customer care", text: "Calls, messages and support for every order." },
  { icon: "lucide:shield-check", title: "Quality & compliance", text: "Standards, licensing and patient safety." },
];

const EVENTS = [
  { date: "5 Dec 2026", title: "Free blood pressure check day", where: "Riverside branch", time: "09:00 to 15:00" },
  { date: "12 Dec 2026", title: "Flu vaccination clinic", where: "Central branch", time: "10:00 to 16:00" },
  { date: "19 Jan 2027", title: "Healthy heart talk with our pharmacists", where: "North branch", time: "18:00 to 19:30" },
];

const SECTIONS = [
  { id: "our-story", label: "Our story" },
  { id: "history", label: "History" },
  { id: "management", label: "Management" },
  { id: "departments", label: "Departments" },
  { id: "events", label: "Events & health days" },
  { id: "locations", label: "Locations" },
  { id: "careers", label: "Careers" },
];

export default async function AboutPage() {
  const branches = await listBranches();
  return (
    <div className="space-y-16">
      <PageRibbon crumbs={[{ label: "Home", href: "/" }, { label: "About us" }]} title="About us" />

      <nav aria-label="On this page" className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-ink transition hover:bg-slate-100">
            {s.label}
          </a>
        ))}
      </nav>

      <section id="our-story" aria-labelledby="story-heading" className="scroll-mt-28 mx-auto max-w-3xl space-y-4">
        <h2 id="story-heading" className="text-2xl font-bold text-ink">Our story</h2>
        <p className="text-lg leading-relaxed text-ink/80">
          Link Pharmacy started with a simple idea: healthcare should be close, friendly and easy to reach. Today Link brings
          together a pharmacy, online shopping and Link Mediclinic, so you can get your medicines, advice and care in one place.
        </p>
        <ul className="grid gap-4 md:grid-cols-3 pt-4">
          {VALUES.map((v) => (
            <li key={v.title} className="rounded-sm border border-slate-200 bg-white p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#F4F8D5]">
                <Icon icon={v.icon} className="h-5 w-5 text-ink" aria-hidden />
              </span>
              <p className="mt-4 font-bold text-ink">{v.title}</p>
              <p className="mt-1 text-sm text-muted">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="history" aria-labelledby="history-heading" className="scroll-mt-28 space-y-6">
        <h2 id="history-heading" className="text-2xl font-bold text-ink">Our history</h2>
        <ol className="relative ml-3 space-y-8 border-l-2 border-brand pl-8">
          {HISTORY.map((h) => (
            <li key={h.year} className="relative">
              <span className="absolute -left-[41px] top-1 h-4 w-4 rounded-full border-2 border-white bg-ink" aria-hidden />
              <p className="text-sm font-bold uppercase tracking-wide text-muted">{h.year}</p>
              <p className="mt-1 text-lg font-bold text-ink">{h.title}</p>
              <p className="mt-1 max-w-2xl text-ink/80">{h.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="management" aria-labelledby="management-heading" className="scroll-mt-28 space-y-6">
        <h2 id="management-heading" className="text-2xl font-bold text-ink">Management team</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MANAGEMENT.map((m) => (
            <li key={m.role} className="flex flex-col gap-4 rounded-sm border border-slate-200 bg-white p-6">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F4F8D5] text-lg font-bold text-ink">
                {m.initials}
              </span>
              <div>
                <p className="font-bold text-ink">{m.name}</p>
                <p className="text-sm font-semibold text-muted">{m.role}</p>
              </div>
              <p className="text-sm text-ink/80">{m.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="departments" aria-labelledby="departments-heading" className="scroll-mt-28 space-y-6">
        <h2 id="departments-heading" className="text-2xl font-bold text-ink">Our departments</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((d) => (
            <li key={d.title} className="flex gap-4 rounded-sm bg-[#F7F9F6] p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white">
                <Icon icon={d.icon} className="h-5 w-5 text-ink" aria-hidden />
              </span>
              <div>
                <p className="font-bold text-ink">{d.title}</p>
                <p className="mt-1 text-sm text-muted">{d.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="events" aria-labelledby="events-heading" className="scroll-mt-28 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="events-heading" className="text-2xl font-bold text-ink">Upcoming events & health days</h2>
          <Link href="/customer-care" className="font-semibold text-ink hover:underline">Ask about an event</Link>
        </div>
        <ul className="divide-y divide-slate-200 rounded-sm border border-slate-200 bg-white">
          {EVENTS.map((e) => (
            <li key={e.title} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-6">
              <span className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-md bg-ink text-center text-white">
                <span className="text-xs font-semibold uppercase">{e.date.split(" ")[1]}</span>
                <span className="text-lg font-bold">{e.date.split(" ")[0]}</span>
              </span>
              <div className="flex-1">
                <p className="font-bold text-ink">{e.title}</p>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                  <span className="flex items-center gap-1.5"><Icon icon="lucide:map-pin" className="h-4 w-4" aria-hidden />{e.where}</span>
                  <span className="flex items-center gap-1.5"><Icon icon="lucide:clock" className="h-4 w-4" aria-hidden />{e.time}</span>
                </p>
              </div>
              <span className="text-sm font-semibold text-ink">Free entry</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="locations" aria-labelledby="locations-heading" className="scroll-mt-28 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="locations-heading" className="text-2xl font-bold text-ink">Our locations</h2>
          <Link href="/find-a-pharmacy" className="font-semibold text-ink hover:underline">Find a pharmacy</Link>
        </div>
        <ul className="grid gap-4 md:grid-cols-3">
          {branches.map((b) => (
            <li key={b.id} className="rounded-sm bg-[#F7F9F6] p-5">
              <p className="font-semibold text-ink">{b.name}</p>
              <p className="mt-1 text-sm text-muted">{b.address}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="careers" aria-labelledby="careers-heading" className="scroll-mt-28 rounded-sm bg-[#F4F8D5] p-8">
        <h2 id="careers-heading" className="text-2xl font-bold text-ink">Careers</h2>
        <p className="mt-2 max-w-2xl text-ink/80">
          We are always looking for people who care about their work. Send us your CV and tell us what you would like to do at Link.
        </p>
        <Link
          href="/customer-care"
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 font-semibold text-white transition hover:bg-ink/85"
        >
          Get in touch
          <Icon icon="lucide:arrow-right" className="h-4 w-4" aria-hidden />
        </Link>
      </section>
    </div>
  );
}
