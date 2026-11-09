"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import type { Product } from "@/lib/catalog";
import { ShopProductCard } from "./shop-product-card";

/** Horizontal slider of product cards with previous/next buttons. Scrolls one card at a time. */
export function RelatedSlider({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(products.length > 1);

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
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8; // 24px = gap-6
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  const arrowClass =
    "flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:bg-slate-300";

  return (
    <div className="min-w-0">
      <div className="mb-6 flex justify-end gap-2">
        <button type="button" aria-label="Previous related products" onClick={() => scrollByCard(-1)} disabled={!canPrev} className={arrowClass}>
          <Icon icon="lucide:chevron-left" className="h-5 w-5" aria-hidden />
        </button>
        <button type="button" aria-label="Next related products" onClick={() => scrollByCard(1)} disabled={!canNext} className={arrowClass}>
          <Icon icon="lucide:chevron-right" className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div
        ref={trackRef}
        onScroll={updateEdges}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div key={product.id} className="w-64 shrink-0 snap-start sm:w-72">
            <ShopProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
