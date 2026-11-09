"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { ProductImage } from "./product-image";

export function ShopProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock === 0;

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      currency: product.currency,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="flex h-full flex-col">
      <Link href={`/product/${product.slug}`} className="block aspect-4/3 overflow-hidden rounded-sm bg-slate-50">
        <ProductImage src={product.imageUrl} alt={product.name} fit="contain" className="h-full w-full p-3" />
      </Link>
      <div className="mt-3 flex flex-1 flex-col gap-1">
        {product.brand && <p className="text-xs font-medium uppercase tracking-wide text-muted">{product.brand}</p>}
        <Link href={`/product/${product.slug}`} className="font-semibold leading-snug text-ink hover:underline">
          {product.name}
        </Link>
        <p className="mt-auto pt-2 text-lg font-bold text-ink">{formatMoney(product.price, product.currency)}</p>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        className="mt-3 flex w-full items-center justify-between gap-3 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <span className="flex items-center gap-2">
          <Icon icon="lucide:shopping-bag" className="h-4 w-4 text-brand" aria-hidden />
          {outOfStock ? "Out of stock" : added ? "Added" : "Add to cart"}
        </span>
        <Icon icon="lucide:arrow-right" className="h-4 w-4" aria-hidden />
      </button>
    </article>
  );
}
