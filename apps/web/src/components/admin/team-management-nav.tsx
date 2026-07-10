"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const teamManagementLinks = [
  { href: "/admin/team", label: "Overview" },
  { href: "/admin/team/roles", label: "Roles" },
  { href: "/admin/team/departments", label: "Departments" },
  { href: "/admin/team/members", label: "Team Members" },
];

export function TeamManagementNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-3">
      {teamManagementLinks.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition",
              isActive
                ? "border-cyan-300 bg-cyan-50 text-cyan-800 shadow-[0_12px_30px_rgba(0,212,255,0.12)]"
                : "border-slate-200 bg-white/70 text-slate-700 hover:border-cyan-200 hover:text-slate-900"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
