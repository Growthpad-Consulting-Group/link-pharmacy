import Link from "next/link";
import { Icon } from "@iconify/react";
import { NewsletterForm } from "@/components/newsletter-form";
import { BackToTop } from "@/components/back-to-top";

// Links with href "#" are placeholders for pages that don't exist yet.
const FOOTER_COLUMNS = [
  {
    title: "Customer support",
    links: [
      { label: "Help & contact", href: "/help" },
      { label: "Shipping & delivery", href: "#" },
      { label: "Returns", href: "#" },
      { label: "Customer care", href: "/customer-care" },
      { label: "Special orders", href: "#" },
      { label: "Product recalls", href: "#" },
    ],
  },
  {
    title: "Pharmacy",
    links: [
      { label: "Find a pharmacy", href: "/find-a-pharmacy" },
      { label: "Shop products", href: "/shop" },
      { label: "Upload prescription", href: "/prescriptions" },
      { label: "Health services", href: "/info/health-services" },
      { label: "Ear piercings", href: "/info/ear-piercings" },
    ],
  },
  {
    title: "Mediclinic",
    links: [
      { label: "Clinic services", href: "/info/mediclinic" },
      { label: "Find a clinic", href: "#" },
      { label: "Appointments", href: "#" },
      { label: "Insurance information", href: "#" },
      { label: "Patient Portal", href: "/patient-portal" },
    ],
  },
  {
    title: "About Link",
    links: [
      { label: "Company information", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Become a supplier", href: "#" },
      { label: "Social responsibility", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative isolate mt-24 overflow-hidden bg-ink text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/footer-outline.svg" alt="" width={120} height={160} className="pointer-events-none absolute right-0 top-0 -z-10" />

      {/* Newsletter signup */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-8 md:grid-cols-2 md:gap-16 md:py-10">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-widest">The Link newsletter</p>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">Stay linked.</h2>
            <p className="text-lg text-white/85">Sign up for Link savings and deals.</p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/link-logo.svg" alt="" className="h-10 w-auto" />
          <p className="mt-4 font-bold">Link Pharmacy</p>
          <p className="mt-2 text-sm text-white/70">Pharmacy shopping and clinic care.</p>
          <Link href="/customer-care" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover">
            Contact customer care
            <Icon icon="lucide:arrow-right" className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="font-semibold">{column.title}</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto grid max-w-6xl items-center gap-4 px-4 py-5 text-center text-sm text-white/70 md:grid-cols-3 md:text-left">
          <p>© 2026 Link Pharmacy Ltd.</p>
          <div className="flex justify-center gap-6">
            {/* Policy pages live in src/app/privacy and src/app/terms. */}
            <Link href="/privacy" className="hover:text-white">Privacy policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of use</Link>
          </div>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
