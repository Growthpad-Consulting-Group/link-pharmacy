import { Icon } from "@iconify/react";
import { PageRibbon } from "@/components/page-ribbon";
import { PrescriptionForm } from "@/components/prescription-form";

export const metadata = { title: "Upload prescription" };

const STEPS = [
  { icon: "lucide:upload", title: "Upload", text: "Send a clear photo or scan of your valid prescription." },
  { icon: "lucide:stethoscope", title: "Pharmacist check", text: "A pharmacist checks the prescription before anything is dispensed." },
  { icon: "lucide:package-check", title: "Collect or deliver", text: "We confirm when it is ready and arrange collection or delivery." },
];

export default function PrescriptionsPage() {
  return (
    <div className="space-y-12">
      <PageRibbon crumbs={[{ label: "Home", href: "/" }, { label: "Prescriptions" }]} title="Upload prescription" />

      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4 rounded-sm border border-slate-200 bg-white p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#F4F8D5]">
              <Icon icon={step.icon} className="h-5 w-5 text-ink" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Step {i + 1}</p>
              <p className="font-bold text-ink">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="mx-auto max-w-2xl space-y-6">
        <PrescriptionForm />
        <p className="flex items-start gap-3 text-sm text-muted">
          <Icon icon="lucide:shield-check" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Your prescription is stored securely and only used to prepare your medicine. Read our Privacy policy for details.
        </p>
      </section>
    </div>
  );
}
