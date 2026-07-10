"use client";

import { motion } from "framer-motion";

const cards = [
  { title: "Blood Donation", offset: "-rotate-6 translate-x-0" },
  { title: "Tree Plantation", offset: "rotate-4 translate-x-6" },
  { title: "Education Drive", offset: "-rotate-3 translate-y-6" },
  { title: "Food Distribution", offset: "rotate-6 translate-x-4 translate-y-10" },
  { title: "Community Outreach", offset: "-rotate-6 translate-x-10 translate-y-2" },
];

export function BounceCards() {
  return (
    <div className="relative mx-auto h-[31rem] w-full max-w-[28rem]">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 30, rotate: -8 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: index * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute inset-x-8 rounded-[1.6rem] border border-white/80 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl ${card.offset}`}
          style={{ top: `${index * 3.8}rem` }}
        >
          <div className="mb-6 h-44 rounded-[1.25rem] bg-[linear-gradient(135deg,rgba(0,212,255,0.12),rgba(139,92,246,0.16))]" />
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Outreach</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{card.title}</h3>
        </motion.div>
      ))}
    </div>
  );
}
