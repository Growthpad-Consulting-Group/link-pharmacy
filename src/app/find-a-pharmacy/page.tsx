import { Icon } from "@iconify/react";

export const metadata = { title: "Find a pharmacy" };

export default function FindAPharmacyPage() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 py-20 text-center">
      <Icon icon="lucide:map-pin" className="h-12 w-12 text-muted" aria-hidden />
      <h1 className="text-2xl font-bold">Find a pharmacy</h1>
      <p className="max-w-sm text-muted">Store locations and opening hours are coming soon.</p>
    </div>
  );
}
