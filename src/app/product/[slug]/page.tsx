import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@iconify/react";
import { getProductBySlug } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { AddToCart } from "@/components/add-to-cart";
import { ProductImage } from "@/components/product-image";
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

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <Reveal className="aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <ProductImage src={product.imageUrl} alt={product.name} className="h-full w-full" />
      </Reveal>

      <Reveal delay={0.1} className="flex flex-col gap-5">
        <nav className="text-sm text-muted">
          <Link href="/shop" className="hover:text-ink">Shop</Link>
          <span className="mx-2">/</span>
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-ink">
            {product.category}
          </Link>
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
  );
}
