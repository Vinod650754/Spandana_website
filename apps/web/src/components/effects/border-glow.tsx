import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function BorderGlow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("group relative rounded-[1.5rem] p-[1px] transition duration-300 hover:shadow-[0_0_0_1px_rgba(0,212,255,0.18),0_18px_60px_rgba(139,92,246,0.14)]", className)}>
      <div className="absolute inset-0 rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(0,212,255,0.45),rgba(139,92,246,0.28),rgba(255,255,255,0.2))] opacity-60 blur-[1px] transition-opacity duration-300 group-hover:opacity-100" />
      <div className="glass-panel relative rounded-[1.5rem]">{children}</div>
    </div>
  );
}
