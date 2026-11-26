import { Icon } from "@iconify/react";
import { PageRibbon } from "@/components/page-ribbon";
import { ParallaxHero } from "@/components/parallax-hero";
import { AppointmentForm } from "@/components/appointment-form";

export const metadata = { title: "Link Mediclinic" };

const WHATSAPP_NUMBER = "260976255557";

const INFO_CARDS = [
  {
    icon: "lucide:info",
    title: "About us",
    body: [
      "Our general outpatient clinic, Link Mediclinic, is attached to Link Pharmacy and is conveniently accessible to the community it serves.",
    ],
  },
  {
    icon: "lucide:clock",
    title: "Opening hours",
    lines: [
      ["Mon - Fri", "9am - 7pm"],
      ["Saturdays", "9am - 6pm"],
      ["Sun & public holidays", "10am - 3pm"],
    ],
  },
  {
    icon: "lucide:phone",
    title: "Contact us",
    contacts: [
      { icon: "lucide:mail", text: "mediclinic.pinnacle@linkpharmacy.co.zm", href: "mailto:mediclinic.pinnacle@linkpharmacy.co.zm" },
      { icon: "lucide:phone", text: "+260 976 255 557", href: "tel:+260976255557" },
      { icon: "lucide:phone", text: "+260 211 261 026", href: "tel:+260211261026" },
    ],
    address: "Shop 28, Pinnacle Mall, Corner Chindo & Mutandwa roads, Lusaka, Zambia",
  },
];

const SERVICES = [
  { title: "Blood pressure monitoring", text: "We will assist you with any health concerns and in room procedures including ear wax irrigation & ECGs." },
  { title: "Telehealth consultations", text: "Consult with a doctor or nurse virtually, via telephone or video, and receive tailored medical advice for your health concerns." },
  { title: "Preventative care, health education & advice", text: "Receive tailored advice on stopping smoking, weight management and more." },
  { title: "Disease counselling & health education", text: "Receive advice on long-term management of your asthma, diabetes, high blood pressure, cholesterol, and more." },
  { title: "Clinics: medicals & physical health checks", text: "Get a physical assessment for employment, insurance policy or other purposes." },
  { title: "Travel", text: "When you travel abroad, you may be exposed to diseases you haven’t come across before. Our travel clinic helps assess your risk of contracting these diseases and will advise on precautions to take as well as which vaccinations and medications will assist in protecting you." },
  { title: "Stop smoking", text: "Have your blood sugar tested to allow you to manage your diabetes. Find out what foods to eat to control high blood sugar levels." },
  { title: "Weight counselling", text: "We offer female health assessments including breast examinations, pregnancy tests, cervical smears and other health screening tests. We also offer administration of contraceptive injections." },
  { title: "Blood pressure monitoring", text: "You will be able to manage arterial blood pressure levels and understand your readings." },
  { title: "Immunisation", text: null },
  { title: "Wound care services", text: "We will assist you in managing simple burns and wounds (including suture removal)." },
];

export default function MediclinicPage() {
  return (
    <div className="space-y-16">
      <ParallaxHero image="/link-mediclinic-hero.jpg" alt="">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mediclinic-logo.png" alt="Link Mediclinic" className="h-20 w-auto sm:h-24" />
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">Your Health. Our Priority.</h1>
          <p className="mx-auto max-w-xl text-lg text-white/85">
            Expert outpatient care, close to home and beside Link Pharmacy.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="#appointment"
            className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3.5 font-semibold text-ink shadow-lg transition hover:bg-brand-hover"
          >
            Make an appointment
            <Icon icon="lucide:calendar-check" className="h-5 w-5" aria-hidden />
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-white/60 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white hover:text-ink"
          >
            Book on WhatsApp
            <Icon icon="lucide:message-circle" className="h-5 w-5" aria-hidden />
          </a>
        </div>
      </ParallaxHero>

      <section aria-label="Clinic information" className="grid gap-6 md:grid-cols-3">
        {INFO_CARDS.map((card, i) => {
          // Each card has its own background: lime tint, light sage, then dark ink.
          const dark = i === 2;
          const tone = ["bg-[#F4F8D5] border-[#F4F8D5]", "bg-[#F7F9F6] border-[#F7F9F6]", "bg-ink border-ink"][i];
          const text = dark ? "text-white" : "text-ink";
          const soft = dark ? "text-white/75" : "text-ink/80";
          const muted = dark ? "text-white/70" : "text-muted";
          const rule = dark ? "border-white/15" : "border-slate-200";
          return (
            <article key={card.title} className={`flex flex-col gap-4 rounded-sm border p-6 ${tone}`}>
              <span className={`flex h-11 w-11 items-center justify-center rounded-md ${dark ? "bg-brand" : "bg-white"}`}>
                <Icon icon={card.icon} className="h-5 w-5 text-ink" aria-hidden />
              </span>
              <h2 className={`text-xl font-bold ${text}`}>{card.title}</h2>
              {card.body && card.body.map((p) => <p key={p} className={`leading-relaxed ${soft}`}>{p}</p>)}
              {card.lines && (
                <dl className="space-y-2 text-sm">
                  {card.lines.map(([day, hours]) => (
                    <div key={day} className={`flex justify-between gap-4 border-b pb-2 ${rule}`}>
                      <dt className={`font-semibold ${text}`}>{day}</dt>
                      <dd className={muted}>{hours}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {card.contacts && (
                <ul className="space-y-3 text-sm">
                  {card.contacts.map((c) => (
                    <li key={c.text}>
                      <a href={c.href} className={`flex items-start gap-2 font-medium hover:underline ${text}`}>
                        <Icon icon={c.icon} className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        {c.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {card.address && (
                <p className={`mt-auto flex items-start gap-2 border-t pt-4 text-sm ${rule} ${muted}`}>
                  <Icon icon="lucide:map-pin" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {card.address}
                </p>
              )}
            </article>
          );
        })}
      </section>

      <section aria-labelledby="services-heading" className="space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 id="services-heading" className="text-3xl font-bold text-ink">Our services</h2>
          <p className="text-muted">Here are the services we offer.</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <li key={`${s.title}-${i}`} className="flex flex-col gap-2 rounded-sm bg-[#F7F9F6] p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white">
                <Icon icon="lucide:stethoscope" className="h-4 w-4 text-ink" aria-hidden />
              </span>
              <h3 className="font-bold leading-snug text-ink">{s.title}</h3>
              {s.text && <p className="text-sm leading-relaxed text-ink/80">{s.text}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section id="appointment" aria-labelledby="appointment-heading" className="scroll-mt-28 overflow-hidden rounded-sm bg-ink p-6 text-white sm:p-10">
        <div className="mb-8 max-w-2xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Appointments</p>
          <h2 id="appointment-heading" className="text-3xl font-bold leading-tight sm:text-4xl">Book an appointment to see a doctor or nurse today!</h2>
          <p className="text-white/75">Send us your details and we will call you to confirm a time.</p>
        </div>
        <AppointmentForm />
      </section>
    </div>
  );
}
