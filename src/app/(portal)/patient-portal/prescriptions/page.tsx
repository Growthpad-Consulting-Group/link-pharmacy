import { MyPrescriptions } from "@/components/portal/my-prescriptions";

export const metadata = { title: "My prescriptions" };

export default function PrescriptionsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">My prescriptions</h1>
        <p className="mt-1 text-sm text-muted">Every prescription you have sent, with its current status.</p>
      </header>
      <section className="rounded-xl border border-slate-200 bg-white px-6 shadow-sm">
        <MyPrescriptions />
      </section>
    </div>
  );
}
