import { AnimatedContent } from "@/components/effects/animated-content";
import { SectionHeading } from "@/components/ui/primitives";
import { HomepageCmsEditor } from "@/components/admin/homepage-cms-editor";

export default function AdminSettingsPage() {
  return (
    <section className="space-y-8">
      <AnimatedContent direction="left">
        <SectionHeading eyebrow="Settings" title="Homepage content, contact info, and site controls." description="This area is ready for site settings, hero content, and feature toggles." />
      </AnimatedContent>
      <HomepageCmsEditor />
    </section>
  );
}
