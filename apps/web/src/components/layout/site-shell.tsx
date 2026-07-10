import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { FlowingMenu } from "@/components/effects/flowing-menu";
import { PixelTrail } from "@/components/effects/pixel-trail";
import { ShinyText } from "@/components/effects/shiny-text";
import { navigation } from "@/data/site";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <PixelTrail />
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(0,212,255,0.2),rgba(139,92,246,0.18))] text-sm font-semibold text-slate-900 shadow-[0_12px_32px_rgba(15,23,42,0.1)]">
              S
            </span>
            <span>
              <span className="block text-xs uppercase tracking-[0.35em] text-slate-500">Spandana</span>
              <span className="block text-sm font-medium text-slate-900">SMVIT Social Outreach</span>
            </span>
          </Link>

          <FlowingMenu />

          <Link href="/contact" className="hidden rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 transition hover:border-cyan-200 hover:shadow-[0_12px_28px_rgba(0,212,255,0.12)] lg:inline-flex">
            Join Us
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/70 bg-white/90">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
          <div className="space-y-4">
            <ShinyText>SPANDANA</ShinyText>
            <p className="max-w-md text-sm leading-7 text-slate-600">
              Serving Society, Inspiring Change. A premium social outreach club experience built for action, empathy, and visible impact.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Navigation</p>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-slate-900">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="grid gap-4 text-sm text-slate-600">
            <div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-cyan-500" /> spandana@smvit.edu.in</div>
            <div className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 text-violet-500" /> +91 90000 00000</div>
            <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-emerald-500" /> Sir M Visvesvaraya Institute of Technology, Bengaluru</div>
          </div>
        </div>
      </footer>
    </>
  );
}
