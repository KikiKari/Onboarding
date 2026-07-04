"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";

export function Reveal({ children, delay = 0, className = "" }: PropsWithChildren<{ delay?: number; className?: string }>) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      // Always animate to a visible state on scroll-in. Under reduced motion we
      // skip the offset/duration so content simply appears (never stuck hidden).
      initial={{ opacity: 0, y: reduce ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={reduce ? { duration: 0 } : { duration: 0.8, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
