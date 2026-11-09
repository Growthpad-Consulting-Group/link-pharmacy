"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import type { Product } from "@/lib/catalog";
import { ProductImage } from "./product-image";

/** Horizontal product slider with previous/next arrows. Scrolls one card at a time. */
export function ProductSlider({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);

  function scrollByCard(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8; // 16px = gap-4
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  const arrowClass =
    "flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:bg-slate-300";

  return (
    <div className="min-w-0">
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          aria-label="Previous products"
          onClick={() => scrollByCard(-1)}
          disabled={!canPrev}
          className={arrowClass}
        >
          <Icon icon="lucide:chevron-left" className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Next products"
          onClick={() => scrollByCard(1)}
          disabled={!canNext}
          className={arrowClass}
        >
          <Icon icon="lucide:chevron-right" className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div
        ref={trackRef}
        onScroll={updateEdges}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <article
            key={product.id}
            className="flex h-full min-w-0 shrink-0 snap-start basis-[80%] flex-col p-0 sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-2rem)/3)]"
          >
            <div className="aspect-4/3 overflow-hidden rounded-sm bg-slate-50">
              <ProductImage src={product.imageUrl} alt={product.name} fit="contain" className="h-full w-full p-2" />
            </div>
            <h3 className="mt-3 text-sm font-semibold leading-snug text-ink">{product.name}</h3>
            <p className="text-xs text-muted">{product.category}</p>
            <hr className="my-3 border-slate-200" />
            <Link
              href={`/product/${product.slug}`}
              className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-ink hover:underline"
            >
              View Product <Icon icon="lucide:arrow-right" className="h-4 w-4" aria-hidden />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
