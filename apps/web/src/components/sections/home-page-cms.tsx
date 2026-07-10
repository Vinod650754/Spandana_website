"use client";

import { useEffect, useState } from "react";
import { AnimatedContent } from "@/components/effects/animated-content";
import { BorderGlow } from "@/components/effects/border-glow";
import { BounceCards } from "@/components/effects/bounce-cards";
import { LiquidEther } from "@/components/effects/liquid-ether";
import { ShinyText } from "@/components/effects/shiny-text";
import { TextType } from "@/components/effects/text-type";
import { SiteShell } from "@/components/layout/site-shell";
import { GlassCard, PrimaryButton, SecondaryButton, SectionHeading, StatusPill } from "@/components/ui/primitives";
import type { HomepageButton, HomepageContent } from "@/types/homepage";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1400;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.round(value * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

function HeroButton({ button }: { button: HomepageButton }) {
  if (button.variant === "secondary") {
    return <SecondaryButton href={button.url}>{button.label}</SecondaryButton>;
  }

  return <PrimaryButton href={button.url}>{button.label}</PrimaryButton>;
}

export function HomePageCms({ content }: { content: HomepageContent | null }) {
  if (!content) {
    return (
      <SiteShell>
        <section className="relative overflow-hidden border-b border-slate-200/60 bg-white">
          <div className="absolute inset-0">
            <LiquidEther />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),rgba(255,255,255,0.76)_42%,rgba(248,250,252,0.9))]" />
            <div className="noise-grid absolute inset-0 opacity-40" />
          </div>
          <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-5 py-20 lg:px-8">
            <BorderGlow>
              <GlassCard>
                <p className="text-sm font-medium text-slate-700">Homepage content is unavailable. Please check the CMS connection.</p>
              </GlassCard>
            </BorderGlow>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="relative overflow-hidden border-b border-slate-200/60 bg-white">
        <div className="absolute inset-0">
          <LiquidEther />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),rgba(255,255,255,0.76)_42%,rgba(248,250,252,0.9))]" />
          <div className="noise-grid absolute inset-0 opacity-40" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-8">
          <AnimatedContent direction="left">
            <div className="space-y-8">
              <StatusPill>CMS Managed Homepage</StatusPill>
              <div className="space-y-5">
                <h1 className="max-w-3xl text-6xl font-semibold tracking-tight text-slate-950 sm:text-7xl xl:text-8xl">
                  <ShinyText>{content.hero.title}</ShinyText>
                </h1>
                <p className="text-xl font-medium text-slate-700 sm:text-2xl">{content.hero.subtitle}</p>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  <TextType lines={content.hero.rotatingLines} />
                </p>
              </div>
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{content.hero.body}</p>
              <div className="flex flex-wrap items-center gap-4">
                {content.hero.buttons.map((button) => (
                  <HeroButton key={`${button.label}-${button.url}`} button={button} />
                ))}
              </div>
              <div className="grid gap-4 pt-2 text-sm text-slate-600 sm:grid-cols-3">
                {content.hero.chips.map((chip) => (
                  <div key={chip} className="glass-panel rounded-2xl px-4 py-3">{chip}</div>
                ))}
              </div>
            </div>
          </AnimatedContent>

          <AnimatedContent direction="right" delay={0.1}>
            <BounceCards />
          </AnimatedContent>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <AnimatedContent direction="up">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {content.impact.map((item) => (
              <BorderGlow key={item.label}>
                <div className="p-6">
                  <p className="text-4xl font-semibold tracking-tight text-slate-950"><Counter value={item.value} suffix={item.suffix} /></p>
                  <p className="mt-2 text-sm uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                </div>
              </BorderGlow>
            ))}
          </div>
        </AnimatedContent>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <AnimatedContent direction="left">
          <SectionHeading eyebrow="Featured Sections" title="Purpose-led work shaped into clear action areas." description="Every card is managed through the CMS while preserving the immersive Vision Pro-inspired interface." />
        </AnimatedContent>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {content.featuredSections.map((item, index) => (
            <AnimatedContent key={item.title} direction={index % 2 === 0 ? "up" : "right"} delay={index * 0.08}>
              <BorderGlow>
                <div className="p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-500">{item.title}</p>
                  <p className="mt-4 text-base leading-7 text-slate-600">{item.description}</p>
                </div>
              </BorderGlow>
            </AnimatedContent>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
