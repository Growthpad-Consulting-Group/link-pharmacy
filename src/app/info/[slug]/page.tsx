import { notFound } from "next/navigation";
import { Icon } from "@iconify/react";

// Placeholder pages for sections that are not built yet.
const SECTIONS: Record<string, { title: string; text: string }> = {
  prescriptions: { title: "Prescriptions", text: "Upload, refill and transfer prescriptions online." },
  "health-services": { title: "Health services", text: "Pharmacist consultations, vaccinations and health checks." },
  "ear-piercings": { title: "Ear piercings", text: "Book an ear piercing appointment in store." },
  mediclinic: { title: "Mediclinic", text: "Our clinic services and appointments." },
};

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  return { title: SECTIONS[slug]?.title ?? "Not found" };
}

export default async function InfoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const section = SECTIONS[slug];
  if (!section) notFound();

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 py-20 text-center">
      <Icon icon="lucide:construction" className="h-12 w-12 text-muted" aria-hidden />
      <h1 className="text-2xl font-bold">{section.title}</h1>
      <p className="max-w-sm text-muted">{section.text} Coming soon.</p>
    </div>
  );
}
