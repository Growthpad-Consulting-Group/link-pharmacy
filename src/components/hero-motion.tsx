"use client";

import { motion } from "framer-motion";

/** Decorative floating shapes behind the hero. Purely visual, hidden from assistive tech. */
export function HeroMotion() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <motion.div
        animate={{ y: [0, -18, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl"
      />
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 right-1/4 h-40 w-40 rounded-3xl bg-brand/20 blur-xl"
      />
    </div>
  );
}
