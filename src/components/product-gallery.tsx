"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { ProductImage } from "./product-image";

/** Product photo gallery: main image with previous/next arrows and clickable thumbnails. */
export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const hasMany = count > 1;
  const current = images[index] ?? null;

  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <ProductImage src={current} alt={alt} fit="contain" className="h-full w-full p-6" />

        {hasMany && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-ink text-white transition hover:bg-ink/85"
            >
              <Icon icon="lucide:chevron-left" className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-ink text-white transition hover:bg-ink/85"
            >
              <Icon icon="lucide:chevron-right" className="h-5 w-5" aria-hidden />
            </button>
            <span className="absolute bottom-3 right-3 rounded-md bg-ink/80 px-2.5 py-1 text-xs font-semibold text-white">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {hasMany && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-white transition ${i === index ? "border-brand" : "border-slate-200 hover:border-slate-400"}`}
            >
              <ProductImage src={src} alt="" fit="contain" className="h-full w-full p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
