import type { ReactNode } from "react";
import { BorderGlow } from "@/components/effects/border-glow";
import { AnimatedContent } from "@/components/effects/animated-content";
import { GlassCard, SectionHeading } from "@/components/ui/primitives";

export type CrudLayoutProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function CrudLayout({ eyebrow, title, description, actions, children }: CrudLayoutProps) {
  return (
    <div className="space-y-6">
      <AnimatedContent direction="left">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      </AnimatedContent>

      {actions ? (
        <AnimatedContent direction="up">
          <BorderGlow>
            <GlassCard>{actions}</GlassCard>
          </BorderGlow>
        </AnimatedContent>
      ) : null}

      <AnimatedContent direction="up">{children}</AnimatedContent>
    </div>
  );
}
