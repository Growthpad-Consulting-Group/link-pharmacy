import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@iconify/react";
import { getProducts, getProductBySlug } from "@/lib/catalog";
import { RelatedSlider } from "@/components/related-slider";
import { formatMoney } from "@/lib/format";
import { AddToCart } from "@/components/add-to-cart";
import { ProductGallery } from "@/components/product-gallery";
import { Reveal } from "@/components/reveal";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Product not found" };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Related products: other in-stock items from the same category.
  const related = (await getProducts())
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 12);

  return (
    <div className="space-y-16">
    <div className="grid gap-10 md:grid-cols-2">
      <Reveal>
        <ProductGallery images={product.imageUrls} alt={product.name} />
      </Reveal>

      <Reveal delay={0.1} className="flex flex-col gap-5">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <Link href="/" className="hover:text-ink hover:underline">Home</Link>
          <Icon icon="lucide:chevron-right" className="h-3.5 w-3.5" aria-hidden />
          <Link href="/shop" className="hover:text-ink hover:underline">Shop</Link>
          <Icon icon="lucide:chevron-right" className="h-3.5 w-3.5" aria-hidden />
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-ink hover:underline">
            {product.category}
          </Link>
          <Icon icon="lucide:chevron-right" className="h-3.5 w-3.5" aria-hidden />
          <span aria-current="page" className="font-medium text-ink">{product.name}</span>
        </nav>

        <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>
        <p className="text-3xl font-bold text-ink">{formatMoney(product.price, product.currency)}</p>

        <p className="flex items-center gap-2 text-sm">
          <Icon
            icon={product.stock > 0 ? "lucide:circle-check" : "lucide:circle-x"}
            className={product.stock > 0 ? "text-ink" : "text-rose-500"}
            aria-hidden
          />
          {product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"}
        </p>

        {product.description && <p className="leading-relaxed text-ink/80">{product.description}</p>}

        {product.sku && <p className="text-xs uppercase tracking-wide text-muted/70">SKU: {product.sku}</p>}

        <div className="mt-2">
          <AddToCart product={product} />
        </div>
      </Reveal>
    </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading">
          <div className="mb-6 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/plus-medical.svg" alt="" aria-hidden className="h-8 w-8 shrink-0" />
            <h2 id="related-heading" className="text-2xl font-bold">Related products</h2>
          </div>
          <RelatedSlider products={related} />
        </section>
      )}
    </div>
  );
}
