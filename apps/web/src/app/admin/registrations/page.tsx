import { AnimatedContent } from "@/components/effects/animated-content";
import { BorderGlow } from "@/components/effects/border-glow";
import { GlassCard, SectionHeading } from "@/components/ui/primitives";

export default function AdminRegistrationsPage() {
  return (
    <section className="space-y-8">
      <AnimatedContent direction="left">
        <SectionHeading eyebrow="Registrations" title="Review and export volunteer registrations." description="CSV export and registration review are ready to connect to the API." />
      </AnimatedContent>
      <div className="grid gap-5 lg:grid-cols-2">
        {['Review New Signups', 'Export CSV', 'Approve Volunteers', 'Track Attendance'].map((item) => (
          <AnimatedContent key={item} direction="up">
            <BorderGlow>
              <GlassCard>
                <p className="text-lg font-medium text-slate-950">{item}</p>
              </GlassCard>
            </BorderGlow>
          </AnimatedContent>
        ))}
      </div>
    </section>
  );
}
