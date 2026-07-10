import { AnimatedContent } from "@/components/effects/animated-content";
import { BorderGlow } from "@/components/effects/border-glow";
import { SiteShell } from "@/components/layout/site-shell";
import { GlassCard, SectionHeading } from "@/components/ui/primitives";
import { groupTeamMembersByRole } from "@/lib/team";
import type { TeamMemberResponse } from "@/types/team";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function loadTeamMembers() {
  const response = await fetch(`${apiBaseUrl}/team`, { cache: "no-store" });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as TeamMemberResponse;
  return payload.data;
}

function MemberCard({ member }: { member: TeamMemberResponse["data"][number] }) {
  return (
    <GlassCard className="h-full overflow-hidden p-4">
      <div className="aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-slate-100">
        {member.imageUrl ? (
          <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(0,212,255,0.16),rgba(139,92,246,0.12))] text-3xl font-semibold text-slate-500">
            {member.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs uppercase tracking-[0.35em] text-slate-500">{member.departmentName ?? "Department"}</p>
      <h3 className="mt-2 text-xl font-semibold text-slate-950">{member.name}</h3>
      <p className="mt-1 text-sm text-slate-600">{member.designation ?? "Team Member"}</p>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p>{member.academicYear ? `Academic Year ${member.academicYear}` : "Academic year not set"}</p>
        {member.email ? (
          <a href={`mailto:${member.email}`} className="block transition hover:text-slate-900">
            {member.email}
          </a>
        ) : null}
        {member.linkedin ? (
          <a href={member.linkedin} target="_blank" rel="noreferrer" className="block transition hover:text-slate-900">
            LinkedIn Profile
          </a>
        ) : null}
      </div>
    </GlassCard>
  );
}

export default async function TeamPage() {
  const members = await loadTeamMembers();
  const roleGroups = groupTeamMembersByRole(members);

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <AnimatedContent direction="left">
          <SectionHeading
            eyebrow="Team"
            title="Meet the active team, grouped by role and department."
            description="This page is fully dynamic. Active records from the admin dashboard appear here instantly without any code changes."
          />
        </AnimatedContent>
        <div className="mt-10 space-y-8">
          {roleGroups.length === 0 ? (
            <AnimatedContent direction="up">
              <BorderGlow>
                <GlassCard>
                  <h3 className="text-2xl font-semibold text-slate-950">No team members are active yet</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Once roles, departments, and members are created in the admin dashboard, the public team page will render them automatically.
                  </p>
                </GlassCard>
              </BorderGlow>
            </AnimatedContent>
          ) : null}

          {roleGroups.map((roleGroup) => (
            <AnimatedContent key={roleGroup.id} direction="up">
              <BorderGlow>
                <GlassCard>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-500">Role</p>
                      <h3 className="mt-3 text-3xl font-semibold text-slate-950">{roleGroup.name}</h3>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                      {roleGroup.departments.reduce((count, department) => count + department.members.length, 0)} members
                    </span>
                  </div>

                  <div className="mt-8 space-y-8">
                    {roleGroup.departments.map((departmentGroup) => (
                      <div key={departmentGroup.id} className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h4 className="text-xl font-semibold text-slate-950">{departmentGroup.name}</h4>
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                            {departmentGroup.members.length} members
                          </span>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                          {departmentGroup.members.map((member) => (
                            <AnimatedContent key={member.id} direction="up">
                              <BorderGlow>
                                <MemberCard member={member} />
                              </BorderGlow>
                            </AnimatedContent>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </BorderGlow>
            </AnimatedContent>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
