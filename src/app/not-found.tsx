import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-ink">404</p>
      <h1 className="text-3xl font-bold">We couldn&apos;t find that page</h1>
      <Link href="/shop" className="mt-2 rounded-md bg-brand px-6 py-2.5 font-semibold text-ink hover:bg-brand-hover">
        Back to shop
      </Link>
    </div>
  );
}
