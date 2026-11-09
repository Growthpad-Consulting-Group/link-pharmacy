import Link from "next/link";
import { Icon } from "@iconify/react";
import { getCategories, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export const metadata = { title: "Shop" };

type SearchParams = Promise<{ category?: string; q?: string }>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, q } = await searchParams;
  const all = await getProducts();
  const categories = getCategories(all);

  const term = q?.trim().toLowerCase() ?? "";
  const products = all.filter(
    (p) =>
      (!category || p.category === category) &&
      (!term || p.name.toLowerCase().includes(term) || (p.sku ?? "").toLowerCase().includes(term)),
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{category ?? "All products"}</h1>
          <p className="mt-1 text-muted">{products.length} product{products.length === 1 ? "" : "s"}</p>
        </div>
        <form action="/shop" className="relative w-full md:w-80">
          {category && <input type="hidden" name="category" value={category} />}
          <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/70" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search products or SKU"
            className="w-full rounded-full border border-slate-300 bg-white py-2.5 pl-10 pr-4 outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
          />
        </form>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Categories">
        <Link
          href="/shop"
          className={`rounded-md px-4 py-1.5 text-sm font-medium ${!category ? "bg-brand text-ink" : "bg-white text-ink/80 ring-1 ring-slate-200 hover:bg-slate-100"}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/shop?category=${encodeURIComponent(c)}`}
            className={`rounded-md px-4 py-1.5 text-sm font-medium ${category === c ? "bg-brand text-ink" : "bg-white text-ink/80 ring-1 ring-slate-200 hover:bg-slate-100"}`}
          >
            {c}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-muted">
          No products match your search.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
