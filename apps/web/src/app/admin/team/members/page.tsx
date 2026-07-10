import { AnimatedContent } from "@/components/effects/animated-content";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionHeading } from "@/components/ui/primitives";
import { TeamManagementNav } from "@/components/admin/team-management-nav";
import { TeamMemberManager } from "@/components/admin/team-member-manager";

export default function AdminTeamMembersPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <AnimatedContent direction="left">
          <SectionHeading
            eyebrow="Team Members"
            title="Add members, assign roles and departments, and manage profile images."
            description="Members stay editable from the admin dashboard, while the public team page stays fully dynamic and grouped by role and department."
          />
        </AnimatedContent>
        <div className="mt-8">
          <TeamManagementNav />
        </div>
        <div className="mt-10">
          <AnimatedContent direction="up">
            <TeamMemberManager />
          </AnimatedContent>
        </div>
      </section>
    </SiteShell>
  );
}
