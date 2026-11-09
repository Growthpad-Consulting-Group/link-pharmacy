"use client";

import type { MouseEvent } from "react";
import { Icon } from "@iconify/react";

export function BackToTop() {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <a href="#" onClick={handleClick} className="inline-flex items-center justify-center gap-2 hover:text-white md:justify-self-end">
      Back to top
      <Icon icon="lucide:arrow-up" className="h-4 w-4" aria-hidden />
    </a>
  );
}
