import { Icon } from "@iconify/react";
import { PageRibbon } from "@/components/page-ribbon";
import { ContactForm } from "@/components/contact-form";
import { CONTACT } from "@/lib/contact";

export const metadata = { title: "Help & contact" };


const FAQ = [
  {
    q: "How long does delivery take?",
    a: "Most orders are confirmed the same day. Delivery times depend on your location, and our team will confirm the estimate when they process your order.",
  },
  {
    q: "Can I order a prescription online?",
    a: "Yes. Upload a clear photo of your valid prescription on the Upload prescription page, and a pharmacist will check it before dispensing.",
  },
  {
    q: "What if an item arrives damaged or incorrect?",
    a: "Contact us within 48 hours with your order reference and a photo of the item. We will replace it or refund you.",
  },
  {
    q: "Can I return medicines?",
    a: "For safety reasons, medicines and opened personal care items cannot be returned. Unopened, unexpired products may be returned within 14 days. See our Terms of use for details.",
  },
  {
    q: "Do you offer pharmacist advice?",
    a: "Yes. Our pharmacists can advise on products and medicines. For medical concerns, please see a doctor or visit Link Mediclinic.",
  },
];

export default function HelpPage() {
  const details = [
    { icon: "lucide:phone", label: "Call us", value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` },
    { icon: "lucide:mail", label: "Email us", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { icon: "lucide:clock", label: "Opening hours", value: CONTACT.hours },
    { icon: "lucide:map-pin", label: "Visit us", value: CONTACT.address },
  ];

  return (
    <div className="space-y-16">
      <PageRibbon crumbs={[{ label: "Home", href: "/" }, { label: "Help & contact" }]} title="Help & contact" />

      <section className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <p className="text-lg leading-relaxed text-ink/80">
            Have a question about an order, a prescription or a product? Reach us by phone, email or the form.
          </p>
          <ul className="space-y-3">
            {details.map((d) => (
              <li key={d.label} className="flex items-start gap-4 rounded-sm border border-slate-200 bg-white p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#F4F8D5]">
                  <Icon icon={d.icon} className="h-5 w-5 text-ink" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{d.label}</p>
                  {d.href ? (
                    <a href={d.href} className="font-semibold text-ink hover:underline">{d.value}</a>
                  ) : (
                    <p className="font-semibold text-ink">{d.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl space-y-4">
        <h2 id="faq-heading" className="text-2xl font-bold text-ink">Frequently asked questions</h2>
        {FAQ.map((item) => (
          <details key={item.q} className="group rounded-sm border border-slate-200 bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
              {item.q}
              <Icon icon="lucide:chevron-down" className="h-5 w-5 shrink-0 transition group-open:rotate-180" aria-hidden />
            </summary>
            <p className="mt-3 leading-relaxed text-ink/80">{item.a}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
