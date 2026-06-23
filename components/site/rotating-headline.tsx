"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function RotatingHeadline({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setIndex((value) => (value + 1) % words.length), 2400);
    return () => window.clearInterval(id);
  }, [reduce, words.length]);
  return (
    <span className="inline-grid min-w-[5.8em] text-accent italic">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          className="col-start-1 row-start-1"
          key={words[index]}
          initial={reduce ? false : { opacity: 0, y: "0.45em" }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: "-0.35em" }}
          transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
