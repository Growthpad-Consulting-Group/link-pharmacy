"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/** Fades and lifts children into view the first time they scroll into the viewport. */
export function Reveal({ delay = 0, className, children, ...props }: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
