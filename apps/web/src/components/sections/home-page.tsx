"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { AnimatedContent } from "@/components/effects/animated-content";
import { BorderGlow } from "@/components/effects/border-glow";
import { BounceCards } from "@/components/effects/bounce-cards";
import { LiquidEther } from "@/components/effects/liquid-ether";
import { ShinyText } from "@/components/effects/shiny-text";
import { TextType } from "@/components/effects/text-type";
import { GlassCard, PrimaryButton, SecondaryButton, SectionHeading, StatusPill } from "@/components/ui/primitives";
import { aboutPreview, featuredEvents, galleryItems, heroRotatingLines, impactStats, testimonials } from "@/data/site";
import { SiteShell } from "@/components/layout/site-shell";
import type { TeamMemberResponse } from "@/types/team";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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

export function HomePage() {
  const [teamPreview, setTeamPreview] = useState<TeamMemberResponse["data"]>([]);

  useEffect(() => {
    const loadTeamPreview = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/team`, { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as TeamMemberResponse;
        setTeamPreview(payload.data.slice(0, 4));
      } catch {
        setTeamPreview([]);
      }
    };

    void loadTeamPreview();
  }, []);

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
              <StatusPill>Social Outreach Club of SMVIT</StatusPill>
              <div className="space-y-5">
                <h1 className="max-w-3xl text-6xl font-semibold tracking-tight text-slate-950 sm:text-7xl xl:text-8xl">
                  <ShinyText>SPANDANA</ShinyText>
                </h1>
                <p className="text-xl font-medium text-slate-700 sm:text-2xl">Social Outreach Club</p>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  <TextType lines={heroRotatingLines} />
                </p>
              </div>
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Premium community action, event precision, and visible public impact. Spandana connects students, faculty, and neighborhoods through structured service.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <PrimaryButton href="/events">Explore Events</PrimaryButton>
                <SecondaryButton href="/contact">Join Us</SecondaryButton>
              </div>
              <div className="grid gap-4 pt-2 text-sm text-slate-600 sm:grid-cols-3">
                <div className="glass-panel rounded-2xl px-4 py-3">Blood Donation</div>
                <div className="glass-panel rounded-2xl px-4 py-3">Environmental Action</div>
                <div className="glass-panel rounded-2xl px-4 py-3">Education Outreach</div>
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
            {impactStats.map((item) => (
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
          <SectionHeading eyebrow="About Preview" title="Mission, vision, and objectives built into one premium social platform." description="Spandana is designed like a modern startup product: elegant, trustworthy, and focused on action that is easy to understand at a glance." />
        </AnimatedContent>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {aboutPreview.map((item, index) => (
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

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <AnimatedContent direction="up">
          <SectionHeading eyebrow="Featured Events" title="Program cards that feel built for a premium campus calendar." description="Each event card carries a visual hierarchy, hover depth, and live status treatment suitable for a contemporary outreach platform." />
        </AnimatedContent>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {featuredEvents.map((event, index) => (
            <AnimatedContent key={event.slug} direction={index % 2 === 0 ? "left" : "right"} delay={index * 0.05}>
              <BorderGlow>
                <article className="overflow-hidden p-4">
                  <div className="group relative overflow-hidden rounded-[1.2rem]">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
                    <img src={event.image} alt={event.title} className="h-64 w-full object-cover transition duration-700 group-hover:scale-110" />
                  </div>
                  <div className="space-y-4 p-4 pb-2">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
                      <span className="inline-flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-cyan-500" /> {event.date}</span>
                      <span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-violet-500" /> {event.location}</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-950">{event.title}</h3>
                    <p className="text-sm leading-7 text-slate-600">A high-impact public welfare initiative delivered with premium coordination and volunteer energy.</p>
                    <div className="flex items-center justify-between">
                      <StatusPill>{event.status}</StatusPill>
                      <PrimaryButton href={`/events/${event.slug}`}>View Event <ArrowRight className="ml-2 h-4 w-4" /></PrimaryButton>
                    </div>
                  </div>
                </article>
              </BorderGlow>
            </AnimatedContent>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <AnimatedContent direction="up">
          <SectionHeading eyebrow="Impact Gallery" title="A visual story told like a premium product showcase." description="Masonry composition, large images, and strong spacing create a gallery feel closer to Apple Photos than a standard college archive." />
        </AnimatedContent>
        <div className="mt-10 columns-1 gap-5 md:columns-2 xl:columns-3">
          {galleryItems.map((item) => (
            <AnimatedContent key={item.title} direction="up">
              <BorderGlow className="mb-5 break-inside-avoid">
                <div className="group overflow-hidden p-3">
                  <div className="relative overflow-hidden rounded-[1.2rem]">
                    <img src={item.image} alt={item.title} className="h-auto w-full object-cover transition duration-700 group-hover:scale-105 group-hover:blur-[1px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                  <div className="px-2 py-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-500">{item.category}</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{item.title}</p>
                  </div>
                </div>
              </BorderGlow>
            </AnimatedContent>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <AnimatedContent direction="left">
          <SectionHeading eyebrow="Success Stories" title="Community feedback and volunteer sentiment presented as polished story cards." description="The section structure is intentionally editorial, with room for trust-building content rather than generic quotes." />
        </AnimatedContent>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <AnimatedContent key={testimonial.name} direction={index % 2 === 0 ? "left" : "right"}>
              <BorderGlow>
                <GlassCard className="h-full">
                  <Sparkles className="h-5 w-5 text-cyan-500" />
                  <p className="mt-5 text-sm leading-7 text-slate-700">“{testimonial.quote}”</p>
                  <div className="mt-6">
                    <p className="font-medium text-slate-950">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </GlassCard>
              </BorderGlow>
            </AnimatedContent>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <AnimatedContent direction="up">
          <SectionHeading eyebrow="Team" title="Faculty and student coordinators with a glassmorphism presentation." description="High-trust profiles are critical for outreach. The cards leave enough room for photos, names, roles, and social links." />
        </AnimatedContent>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {teamPreview.length === 0 ? (
            <AnimatedContent direction="up">
              <BorderGlow>
                <GlassCard>
                  <h3 className="text-2xl font-semibold text-slate-950">Team preview will appear here once members are published</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Add active team members in the admin dashboard and this section will update automatically.
                  </p>
                </GlassCard>
              </BorderGlow>
            </AnimatedContent>
          ) : null}

          {teamPreview.map((member) => (
            <AnimatedContent key={member.id} direction="up">
              <BorderGlow>
                <div className="overflow-hidden p-4">
                  <div className="overflow-hidden rounded-[1.2rem] bg-slate-100">
                    {member.imageUrl ? (
                      <img src={member.imageUrl} alt={member.name} className="h-56 w-full object-cover" />
                    ) : (
                      <div className="flex h-56 w-full items-center justify-center bg-[linear-gradient(135deg,rgba(0,212,255,0.16),rgba(139,92,246,0.12))] text-3xl font-semibold text-slate-500">
                        {member.name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.35em] text-slate-500">{member.departmentName ?? member.roleName ?? "Team"}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{member.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{member.designation ?? "Team Member"}</p>
                </div>
              </BorderGlow>
            </AnimatedContent>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <AnimatedContent direction="up">
          <BorderGlow>
            <div className="grid gap-8 p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-500">Contact</p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Ready to volunteer, partner, or support the next drive?</h2>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">We keep contact actions simple, visible, and direct, with space for WhatsApp, Instagram, LinkedIn, email, and map-based discovery.</p>
                <div className="flex flex-wrap gap-4">
                  <PrimaryButton href="/contact">Open Contact Page</PrimaryButton>
                  <SecondaryButton href="/admin">Admin Panel</SecondaryButton>
                </div>
              </div>
              <div className="space-y-4">
                <div className="glass-panel rounded-[1.4rem] p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Email</p>
                  <p className="mt-2 text-lg font-medium text-slate-900">spandana@smvit.edu.in</p>
                </div>
                <div className="glass-panel rounded-[1.4rem] p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Phone</p>
                  <p className="mt-2 text-lg font-medium text-slate-900">+91 90000 00000</p>
                </div>
                <div className="glass-panel rounded-[1.4rem] p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Instagram</p>
                  <p className="mt-2 text-lg font-medium text-slate-900">@spandana.smvit</p>
                </div>
              </div>
            </div>
          </BorderGlow>
        </AnimatedContent>
      </section>
    </SiteShell>
  );
}
