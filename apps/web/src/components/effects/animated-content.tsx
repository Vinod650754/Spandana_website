"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function AnimatedContent({ children, direction = "up", delay = 0 }: { children: ReactNode; direction?: "up" | "left" | "right" | "down"; delay?: number }) {
  const offsets = {
    up: { y: 24, x: 0 },
    down: { y: -24, x: 0 },
    left: { y: 0, x: -24 },
    right: { y: 0, x: 24 },
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, ...offsets[direction] }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
