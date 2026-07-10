import Link from "next/link";
import { Shield, BarChart3, Image, Users, CalendarDays, FileDown, Settings } from "lucide-react";
import { AnimatedContent } from "@/components/effects/animated-content";
import { BorderGlow } from "@/components/effects/border-glow";
import { GlassCard, PrimaryButton, SectionHeading } from "@/components/ui/primitives";

const adminSections = [
  { icon: BarChart3, title: "Dashboard", href: "/admin/dashboard" },
  { icon: CalendarDays, title: "Manage Events", href: "/admin/events" },
  { icon: Image, title: "Manage Gallery", href: "/admin/gallery" },
  { icon: Users, title: "Team Management", href: "/admin/team" },
  { icon: Settings, title: "CMS Settings", href: "/admin/settings" },
  { icon: FileDown, title: "Registrations", href: "/admin/registrations" },
];

export default function AdminHomePage() {
  return (
    <section className="space-y-8">
      <AnimatedContent direction="left">
        <SectionHeading eyebrow="Admin" title="Secure management surface for content, registrations, and campaign operations." description="Public pages never expose login, but the admin route is intentionally separate and more utilitarian." />
      </AnimatedContent>
      <div className="grid gap-5 lg:grid-cols-2">
        <AnimatedContent direction="left">
          <BorderGlow>
            <GlassCard>
              <Shield className="h-5 w-5 text-cyan-500" />
              <h3 className="mt-4 text-2xl font-semibold text-slate-950">Authentication lives here only.</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Use the login entry point in the admin section to access JWT-protected tools and content management screens.</p>
              <div className="mt-6 flex flex-wrap gap-4">
                <PrimaryButton href="/admin/login">Open Login</PrimaryButton>
                <Link href="/" className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900">Back to Site</Link>
              </div>
            </GlassCard>
          </BorderGlow>
        </AnimatedContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {adminSections.map((section) => (
            <AnimatedContent key={section.href} direction="up">
              <BorderGlow>
                <Link href={section.href} className="block p-5">
                  <section.icon className="h-5 w-5 text-violet-500" />
                  <p className="mt-4 text-lg font-medium text-slate-950">{section.title}</p>
                  <p className="mt-2 text-sm text-slate-600">Open management surface</p>
                </Link>
              </BorderGlow>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}
