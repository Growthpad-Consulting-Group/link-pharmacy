"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import type { Product } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { ProductImage } from "./product-image";

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock === 0;
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-slate-50">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink">{product.category}</p>
        <Link href={`/product/${product.slug}`} className="font-semibold text-ink hover:text-ink">
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-ink">{formatMoney(product.price, product.currency)}</span>
          <span className="inline-flex items-center gap-1 text-sm text-muted">
            <Icon icon={outOfStock ? "lucide:circle-x" : "lucide:circle-check"} className={outOfStock ? "text-rose-500" : "text-ink"} aria-hidden />
            {outOfStock ? "Unavailable" : "In stock"}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
