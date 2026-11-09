"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

type Tile = { name: string; image: string; bg: string };

/** One-row horizontal category slider with previous/next buttons. Scrolls one card at a time. */
export function CategorySlider({ tiles }: { tiles: Tile[] }) {
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
        <button type="button" aria-label="Previous categories" onClick={() => scrollByCard(-1)} disabled={!canPrev} className={arrowClass}>
          <Icon icon="lucide:chevron-left" className="h-5 w-5" aria-hidden />
        </button>
        <button type="button" aria-label="Next categories" onClick={() => scrollByCard(1)} disabled={!canNext} className={arrowClass}>
          <Icon icon="lucide:chevron-right" className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div
        ref={trackRef}
        onScroll={updateEdges}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tiles.map((tile) => (
          <Link
            key={tile.name}
            href={`/shop?category=${encodeURIComponent(tile.name)}`}
            style={{ backgroundColor: tile.bg }}
            className="group flex w-56 shrink-0 snap-start items-stretch justify-between gap-3 rounded-sm border border-slate-200 p-3 pl-4 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md sm:w-64"
          >
            <span className="flex min-w-0 flex-col items-start justify-between self-stretch py-1">
              <span className="text-sm font-semibold leading-snug text-ink">{tile.name}</span>
              <Icon
                icon="lucide:arrow-right"
                className="h-4 w-4 text-ink transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tile.image} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-sm object-contain" />
          </Link>
        ))}
      </div>
    </div>
  );
}
