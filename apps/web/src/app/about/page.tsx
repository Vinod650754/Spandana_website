import { AnimatedContent } from "@/components/effects/animated-content";
import { BorderGlow } from "@/components/effects/border-glow";
import { SiteShell } from "@/components/layout/site-shell";
import { GlassCard, SectionHeading } from "@/components/ui/primitives";
import { aboutPreview } from "@/data/site";

const timeline = [
  { year: "2018", title: "Club formation", text: "Spandana begins as a structured social outreach initiative at SMVIT." },
  { year: "2021", title: "Program expansion", text: "Volunteer operations grow across blood donation, literacy, and food drives." },
  { year: "2024", title: "Digital presence", text: "A more polished, community-first identity is introduced with better event visibility." },
  { year: "2026", title: "Premium platform", text: "The outreach experience becomes product-like, responsive, and deeply interactive." },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <AnimatedContent direction="left">
          <SectionHeading eyebrow="About" title="A club built around service, clarity, and repeatable impact." description="The About page focuses on the club story, timeline, and operating philosophy in a premium editorial layout." />
        </AnimatedContent>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {aboutPreview.map((item, index) => (
            <AnimatedContent key={item.title} direction={index % 2 === 0 ? "up" : "right"}>
              <BorderGlow>
                <GlassCard className="h-full">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-500">{item.title}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
                </GlassCard>
              </BorderGlow>
            </AnimatedContent>
          ))}
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-2">
          <AnimatedContent direction="left">
            <BorderGlow>
              <GlassCard className="h-full">
                <h3 className="text-2xl font-semibold text-slate-950">Club History</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Spandana evolved from a small volunteer group into a high-functioning outreach club that plans, executes, and measures public welfare programs.
                </p>
              </GlassCard>
            </BorderGlow>
          </AnimatedContent>
          <AnimatedContent direction="right">
            <BorderGlow>
              <GlassCard className="h-full">
                <h3 className="text-2xl font-semibold text-slate-950">Operating Style</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Every campaign is treated like a product launch: clear roles, elegant communication, sharp visuals, and outcomes that can be reviewed later.
                </p>
              </GlassCard>
            </BorderGlow>
          </AnimatedContent>
        </div>

        <div className="mt-16">
          <AnimatedContent direction="up">
            <SectionHeading eyebrow="Journey Timeline" title="Key milestones in the club's growth." />
          </AnimatedContent>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {timeline.map((item) => (
              <AnimatedContent key={item.year} direction="up">
                <BorderGlow>
                  <GlassCard>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{item.year}</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                  </GlassCard>
                </BorderGlow>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
