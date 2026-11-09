import { Icon } from "@iconify/react";

export const metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 py-20 text-center">
      <Icon icon="lucide:user-round" className="h-12 w-12 text-muted" aria-hidden />
      <h1 className="text-2xl font-bold">Your account</h1>
      <p className="max-w-sm text-muted">Sign-in and order history are coming soon.</p>
    </div>
  );
}
