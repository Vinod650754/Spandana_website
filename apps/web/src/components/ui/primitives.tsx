import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function GlassCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("glass-panel relative overflow-hidden rounded-[1.75rem] p-6", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.12),transparent_36%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="max-w-3xl space-y-4">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-500">{eyebrow}</p> : null}
      <h2 className="text-balance font-[var(--font-space-grotesk)] text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
        {title}
      </h2>
      {description ? <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p> : null}
    </div>
  );
}

export function PrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.22)]"
    >
      {children}
    </Link>
  );
}

export function ActionButton({
  onClick,
  children,
  disabled = false,
  className = "",
  type = "button",
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.22)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/70 px-5 py-3 text-sm font-medium text-slate-900 backdrop-blur transition-transform duration-300 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_20px_45px_rgba(56,189,248,0.12)]"
    >
      {children}
    </Link>
  );
}

export function StatusPill({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">{children}</span>;
}
