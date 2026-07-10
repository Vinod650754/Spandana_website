import { AnimatedContent } from "@/components/effects/animated-content";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionHeading } from "@/components/ui/primitives";
import { TeamManagementNav } from "@/components/admin/team-management-nav";
import { CatalogManager } from "@/components/admin/catalog-manager";

export default function AdminTeamRolesPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <AnimatedContent direction="left">
          <SectionHeading
            eyebrow="Roles"
            title="Manage the role catalog used across the public team directory."
            description="Add, edit, disable, reorder, and delete roles without changing code. Deletions are blocked when a role is still assigned to members."
          />
        </AnimatedContent>
        <div className="mt-8">
          <TeamManagementNav />
        </div>
        <div className="mt-10">
          <AnimatedContent direction="up">
            <CatalogManager
              endpoint="/roles"
              title="Roles"
              description="Roles define how the team is grouped on the public site and in the member editor."
              emptyTitle="No roles configured"
              emptyDescription="Create roles here before adding team members. The public team page only shows active records."
            />
          </AnimatedContent>
        </div>
      </section>
    </SiteShell>
  );
}
