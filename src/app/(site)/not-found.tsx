import Link from "next/link";
import { Mascot } from "@/components/mascot";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-5 py-16 text-center">
      <Mascot size="sm" message="Moyo could not find that page." />
      <p className="text-sm font-semibold uppercase tracking-widest text-ink">404</p>
      <h1 className="text-3xl font-bold">We couldn&apos;t find that page</h1>
      <p className="max-w-md text-muted">The link may be broken or the page may have moved. Try the shop or contact customer care.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="rounded-md bg-ink px-5 py-2.5 font-semibold text-white hover:bg-ink/85">
          Back to shop
        </Link>
        <Link href="/customer-care" className="rounded-md border border-slate-300 px-5 py-2.5 font-semibold text-ink hover:bg-slate-100">
          Contact customer care
        </Link>
      </div>
    </div>
  );
}
