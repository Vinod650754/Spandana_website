"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { navigation } from "@/data/site";

export function FlowingMenu() {
  return (
    <nav className="hidden items-center gap-2 rounded-full border border-white/60 bg-white/75 p-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:flex">
      {navigation.map((item) => (
        <Link key={item.href} href={item.href} className="relative rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
          {item.label}
          <motion.span
            className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-gradient-to-r from-cyan-400 to-violet-500"
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.28 }}
          />
        </Link>
      ))}
    </nav>
  );
}
