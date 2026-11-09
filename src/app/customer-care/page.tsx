import Link from "next/link";
import { Icon } from "@iconify/react";
import { PageRibbon } from "@/components/page-ribbon";
import { ContactForm } from "@/components/contact-form";
import { CONTACT } from "@/lib/contact";

export const metadata = { title: "Customer care" };

const CHANNELS = [
  {
    icon: "lucide:phone",
    title: "Call customer care",
    text: CONTACT.hours,
    action: CONTACT.phone,
    href: `tel:${CONTACT.phone.replace(/\s/g, "")}`,
  },
  {
    icon: "lucide:message-circle",
    title: "WhatsApp us",
    text: "Quick answers to order and product questions.",
    action: CONTACT.whatsapp,
    href: `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`,
  },
  {
    icon: "lucide:mail",
    title: "Email us",
    text: "We reply within one working day.",
    action: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
  },
];

const TOPICS = [
  { icon: "lucide:package", title: "Orders & delivery", text: "Track an order or change a delivery.", href: "/help#faq" },
  { icon: "lucide:file-text", title: "Prescriptions", text: "Upload, refill or ask about a prescription.", href: "/prescriptions" },
  { icon: "lucide:rotate-ccw", title: "Returns & refunds", text: "Damaged or incorrect items, and refunds.", href: "/terms" },
  { icon: "lucide:user-round", title: "Your account", text: "Sign-in and order history, coming soon.", href: "/account" },
];

export default function CustomerCarePage() {
  return (
    <div className="space-y-16">
      <PageRibbon crumbs={[{ label: "Home", href: "/" }, { label: "Customer care" }]} title="Customer care" />

      <section aria-labelledby="channels-heading" className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <h2 id="channels-heading" className="text-2xl font-bold text-ink">How can we reach you?</h2>
          <p className="text-muted">Choose whichever is easiest. Our team is here during opening hours.</p>
        </div>
        <ul className="grid gap-4 md:grid-cols-3">
          {CHANNELS.map((c) => (
            <li key={c.title}>
              <a
                href={c.href}
                className="group flex h-full flex-col gap-4 rounded-sm border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#F4F8D5]">
                  <Icon icon={c.icon} className="h-5 w-5 text-ink" aria-hidden />
                </span>
                <div className="space-y-1">
                  <p className="font-bold text-ink">{c.title}</p>
                  <p className="text-sm text-muted">{c.text}</p>
                </div>
                <span className="mt-auto flex items-center justify-between gap-2 border-t border-slate-200 pt-4 font-semibold text-ink">
                  {c.action}
                  <Icon icon="lucide:arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="topics-heading" className="space-y-6">
        <h2 id="topics-heading" className="text-2xl font-bold text-ink">What do you need help with?</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.map((t) => (
            <li key={t.title}>
              <Link
                href={t.href}
                className="group flex h-full flex-col gap-3 rounded-sm bg-[#F7F9F6] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Icon icon={t.icon} className="h-6 w-6 text-ink" aria-hidden />
                <p className="font-semibold text-ink">{t.title}</p>
                <p className="text-sm text-muted">{t.text}</p>
                <span className="mt-auto flex items-center gap-2 pt-2 text-sm font-semibold text-ink">
                  Go to topic
                  <Icon icon="lucide:arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="message-heading" className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <h2 id="message-heading" className="text-2xl font-bold text-ink">Send us a message</h2>
          <p className="text-muted">
            Tell us what you need and include your order reference if you have one. We reply by email, usually within one working day.
          </p>
          <p className="flex items-center gap-2 text-sm text-muted">
            <Icon icon="lucide:clock" className="h-4 w-4" aria-hidden />
            {CONTACT.hours}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted">
            <Icon icon="lucide:map-pin" className="h-4 w-4" aria-hidden />
            {CONTACT.address}
          </p>
        </div>
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
