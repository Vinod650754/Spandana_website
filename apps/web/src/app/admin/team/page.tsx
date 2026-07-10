import Link from "next/link";
import { CalendarSearch, Layers3, UsersRound } from "lucide-react";
import { AnimatedContent } from "@/components/effects/animated-content";
import { BorderGlow } from "@/components/effects/border-glow";
import { SiteShell } from "@/components/layout/site-shell";
import { GlassCard, SectionHeading } from "@/components/ui/primitives";
import { TeamManagementNav } from "@/components/admin/team-management-nav";

export default function AdminTeamPage() {
  const sections = [
    { title: "Roles", href: "/admin/team/roles", description: "Create and manage all configurable club roles.", icon: Layers3 },
    { title: "Departments", href: "/admin/team/departments", description: "Define the department structure used by team members.", icon: CalendarSearch },
    { title: "Team Members", href: "/admin/team/members", description: "Add members, images, and assignments to roles and departments.", icon: UsersRound },
  ];

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <AnimatedContent direction="left">
          <SectionHeading
            eyebrow="Team Management"
            title="Configure roles, departments, and team members from one place."
            description="This section stays fully data-driven: no hardcoded roles, no hardcoded departments, and no sample members."
          />
        </AnimatedContent>
        <div className="mt-8">
          <TeamManagementNav />
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {sections.map((section) => (
            <AnimatedContent key={section.href} direction="up">
              <BorderGlow>
                <Link href={section.href} className="block h-full">
                  <GlassCard className="h-full">
                    <section.icon className="h-6 w-6 text-cyan-500" />
                    <h3 className="mt-4 text-xl font-semibold text-slate-950">{section.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
                  </GlassCard>
                </Link>
              </BorderGlow>
            </AnimatedContent>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
