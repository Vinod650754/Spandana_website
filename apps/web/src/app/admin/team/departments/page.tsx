import { AnimatedContent } from "@/components/effects/animated-content";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionHeading } from "@/components/ui/primitives";
import { TeamManagementNav } from "@/components/admin/team-management-nav";
import { CatalogManager } from "@/components/admin/catalog-manager";

export default function AdminTeamDepartmentsPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <AnimatedContent direction="left">
          <SectionHeading
            eyebrow="Departments"
            title="Manage the department catalog for team assignment and grouping."
            description="Departments can be enabled, disabled, reordered, and deleted only when no members are assigned to them."
          />
        </AnimatedContent>
        <div className="mt-8">
          <TeamManagementNav />
        </div>
        <div className="mt-10">
          <AnimatedContent direction="up">
            <CatalogManager
              endpoint="/departments"
              title="Departments"
              description="Departments help organize members beneath each role in the public directory."
              emptyTitle="No departments configured"
              emptyDescription="Create departments here before adding team members."
            />
          </AnimatedContent>
        </div>
      </section>
    </SiteShell>
  );
}
