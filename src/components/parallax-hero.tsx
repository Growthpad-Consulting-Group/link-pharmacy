"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/** Full-screen hero whose background image moves slower than the page as you scroll (parallax). */
export function ParallaxHero({ image, alt, children }: { image: string; alt: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  return (
    <section
      ref={ref}
      className="relative left-1/2 -mt-10 flex min-h-[100svh] w-screen -translate-x-1/2 items-center justify-center overflow-hidden bg-ink text-white"
    >
      <motion.div style={{ y }} className="absolute inset-x-0 -top-[12%] -bottom-[12%]" aria-hidden={alt === ""}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={alt} className="h-full w-full object-cover" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/55 to-ink/85" />
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-4 py-24 text-center">
        {children}
      </div>
    </section>
  );
}
