import Link from "next/link";
import { Icon } from "@iconify/react";
import { getCategories, getProducts, type Product } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { CATEGORY_TILES } from "@/lib/categories";
import { CategorySlider } from "@/components/category-slider";
import { ShopProductCard } from "@/components/shop-product-card";
import { SortSelect } from "@/components/sort-select";

export const metadata = { title: "Shop" };

type Raw = Record<string, string | string[] | undefined>;
type SearchParams = Promise<Raw>;

const SORTS: Record<string, (a: Product, b: Product) => number> = {
  "name-asc": (a, b) => a.name.localeCompare(b.name),
  "name-desc": (a, b) => b.name.localeCompare(a.name),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
};

const toArray = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// Parses a price bound from the URL; returns null when empty or not a number.
function parseBound(v: string | undefined): number | null {
  if (v === undefined || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const cats = toArray(params.category);
  const brands = toArray(params.brand);
  const minPrice = parseBound(first(params.min));
  const maxPrice = parseBound(first(params.max));
  const sort = first(params.sort) ?? "name-asc";
  const q = first(params.q) ?? "";

  const all = await getProducts();
  const currency = all[0]?.currency ?? "USD";
  const categories = getCategories(all);
  const brandOptions = [...new Set(all.map((p) => p.brand).filter((b): b is string => Boolean(b)))].sort();

  const term = q.trim().toLowerCase();
  const products = all
    .filter(
      (p) =>
        (cats.length === 0 || cats.includes(p.category)) &&
        (brands.length === 0 || (p.brand !== null && brands.includes(p.brand))) &&
        (minPrice === null || p.price >= minPrice) &&
        (maxPrice === null || p.price <= maxPrice) &&
        (!term || p.name.toLowerCase().includes(term) || (p.sku ?? "").toLowerCase().includes(term)),
    )
    .sort(SORTS[sort] ?? SORTS["name-asc"]);

  const PAGE_SIZE = 9;
  const requestedPage = Number(first(params.page));
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const page = Number.isInteger(requestedPage) && requestedPage >= 1 ? Math.min(requestedPage, totalPages) : 1;
  const pageProducts = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Builds a link to another page that keeps every current filter, search and sort.
  function pageHref(n: number): string {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === "page" || value === undefined) continue;
      for (const v of Array.isArray(value) ? value : [value]) qs.append(key, v);
    }
    if (n > 1) qs.set("page", String(n));
    const str = qs.toString();
    return str ? `/shop?${str}` : "/shop";
  }

  const title = cats.length === 1 ? cats[0] : "All products";

  return (
    <div className="space-y-8">
      {/* Full-bleed ribbon: breaks out of the page container so the band spans the screen width. */}
      <header className="relative -mt-10 left-1/2 w-screen -translate-x-1/2 bg-[#F4F8D5]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 md:flex-row md:items-end md:justify-between">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted">
              <Link href="/" className="hover:text-ink hover:underline">Home</Link>
              <Icon icon="lucide:chevron-right" className="h-3.5 w-3.5" aria-hidden />
              <span className="font-medium text-ink">Shop</span>
            </nav>
            <div className="mt-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/plus-medical.svg" alt="" aria-hidden className="h-8 w-8 shrink-0" />
              <h1 className="text-3xl font-bold">{title}</h1>
            </div>
          </div>
          <form action="/shop" className="relative w-full md:w-80">
            {cats.map((c) => (
              <input key={c} type="hidden" name="category" value={c} />
            ))}
            {brands.map((b) => (
              <input key={b} type="hidden" name="brand" value={b} />
            ))}
            {minPrice !== null && <input type="hidden" name="min" value={minPrice} />}
            {maxPrice !== null && <input type="hidden" name="max" value={maxPrice} />}
            <input type="hidden" name="sort" value={sort} />
            <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/70" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search products or SKU"
              className="w-full rounded-full border border-slate-300 bg-white py-2.5 pl-10 pr-4 outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
            />
          </form>
        </div>
      </header>

      <CategorySlider tiles={CATEGORY_TILES} />

      <form action="/shop" className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {q && <input type="hidden" name="q" value={q} />}

        <aside className="h-fit rounded-sm bg-[#F7F9F6] p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-ink">Filters</h2>

          <fieldset className="mt-5">
            <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Category</legend>
            <div className="flex flex-col gap-2">
              {categories.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" name="category" value={c} defaultChecked={cats.includes(c)} className="h-4 w-4 accent-ink" />
                  {c}
                </label>
              ))}
            </div>
          </fieldset>

          {brandOptions.length > 0 && (
            <fieldset className="mt-6">
              <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Brand</legend>
              <div className="flex flex-col gap-2">
                {brandOptions.map((b) => (
                  <label key={b} className="flex items-center gap-2 text-sm text-ink">
                    <input type="checkbox" name="brand" value={b} defaultChecked={brands.includes(b)} className="h-4 w-4 accent-ink" />
                    {b}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="mt-6">
            <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Price range</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                Min ({currency})
                <input
                  type="number"
                  name="min"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  defaultValue={minPrice ?? ""}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                Max ({currency})
                <input
                  type="number"
                  name="max"
                  min={0}
                  step="0.01"
                  placeholder="Any"
                  defaultValue={maxPrice ?? ""}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
                />
              </label>
            </div>
          </fieldset>

          <div className="mt-6 flex flex-col gap-2">
            <button type="submit" className="rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/85">
              Apply filters
            </button>
            <Link href="/shop" className="text-center text-sm font-semibold text-ink hover:underline">
              Clear all
            </Link>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 flex justify-end">
            <SortSelect defaultValue={sort} />
          </div>

          {products.length === 0 ? (
            <p className="rounded-sm border border-dashed border-slate-300 py-16 text-center text-muted">
              No products match these filters.
            </p>
          ) : (
            <>
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {pageProducts.map((product) => (
                  <ShopProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
                  <Link
                    href={pageHref(page - 1)}
                    aria-disabled={page === 1}
                    tabIndex={page === 1 ? -1 : undefined}
                    className={`flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white ${page === 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-100"}`}
                  >
                    <Icon icon="lucide:chevron-left" className="h-4 w-4" aria-label="Previous page" />
                  </Link>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <Link
                      key={n}
                      href={pageHref(n)}
                      aria-current={n === page ? "page" : undefined}
                      className={`flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm font-semibold ${n === page ? "bg-ink text-white" : "border border-slate-300 bg-white text-ink hover:bg-slate-100"}`}
                    >
                      {n}
                    </Link>
                  ))}
                  <Link
                    href={pageHref(page + 1)}
                    aria-disabled={page === totalPages}
                    tabIndex={page === totalPages ? -1 : undefined}
                    className={`flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white ${page === totalPages ? "pointer-events-none opacity-40" : "hover:bg-slate-100"}`}
                  >
                    <Icon icon="lucide:chevron-right" className="h-4 w-4" aria-label="Next page" />
                  </Link>
                </nav>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}
