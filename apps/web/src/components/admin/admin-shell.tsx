"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, PanelLeftClose, PanelRightClose, Shield, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { adminNavigation } from "./admin-navigation";
import { GlassCard } from "@/components/ui/primitives";

type AdminShellProps = {
  children: ReactNode;
};

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),rgba(248,250,252,0.98)_42%,rgba(241,245,249,1))] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <aside
          className={cn(
            "fixed inset-y-4 left-4 z-50 w-80 -translate-x-[110%] overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : ""
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <Link href="/admin" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(0,212,255,0.2),rgba(139,92,246,0.18))] text-sm font-semibold text-slate-900 shadow-[0_12px_32px_rgba(15,23,42,0.1)]">
                S
              </span>
              <span>
                <span className="block text-xs uppercase tracking-[0.35em] text-slate-500">Admin CMS</span>
                <span className="block text-sm font-medium text-slate-900">SPANDANA Dashboard</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 lg:hidden"
              aria-label="Close sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          <nav className="mt-5 space-y-1 overflow-y-auto pb-24 pr-1">
            {adminNavigation.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              const hasChildren = Boolean(item.children?.length);

              return (
                <div key={item.href} className="space-y-1">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      active ? "bg-cyan-50 text-cyan-800 ring-1 ring-cyan-200" : "text-slate-700 hover:bg-slate-100"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {hasChildren ? <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Group</span> : null}
                  </Link>

                  {hasChildren ? (
                    <div className="ml-5 space-y-1 border-l border-slate-200 pl-3">
                      {item.children?.map((child) => {
                        const childActive = isNavItemActive(pathname, child.href);

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              "block rounded-xl px-3 py-2 text-sm transition",
                              childActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="absolute inset-x-4 bottom-4 space-y-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-4 w-4 text-cyan-500" />
              <p className="text-sm leading-6 text-slate-600">JWT-protected admin access only. Public site remains separate.</p>
            </div>
            <Link href="/admin/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
              <LogOut className="h-4 w-4" />
              Switch account
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="sticky top-4 z-40 rounded-[2rem] border border-slate-200/80 bg-white/80 px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen((current) => !current)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 lg:hidden"
                  aria-label="Toggle sidebar"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Admin Surface</p>
                  <h1 className="text-lg font-semibold text-slate-950">SPANDANA CMS</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
                  Public Site
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("adminToken");
                    window.location.href = "/admin/login";
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 pb-6">{children}</main>
        </div>
      </div>

      {sidebarOpen ? <div className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px] lg:hidden" onClick={() => setSidebarOpen(false)} /> : null}
    </div>
  );
}
