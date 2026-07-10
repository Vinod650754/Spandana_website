import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Sparkles } from "lucide-react";
import { AnimatedContent } from "@/components/effects/animated-content";
import { BorderGlow } from "@/components/effects/border-glow";
import { SiteShell } from "@/components/layout/site-shell";
import { EventCard } from "@/components/events/event-card";
import { GlassCard, SectionHeading, StatusPill } from "@/components/ui/primitives";
import { fetchPublishedEvents } from "@/lib/events-api";
import { groupEventsByTiming } from "@/lib/events";

export const dynamic = "force-dynamic";

function formatEventDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatEventTime(startTime: string | null, endTime: string | null) {
  if (!startTime && !endTime) {
    return "Time to be announced";
  }

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }

  return startTime ?? endTime ?? "Time to be announced";
}

export default async function EventsPage() {
  const { data } = await fetchPublishedEvents();
  const { upcoming, past } = groupEventsByTiming(data);
  const featuredEvent = upcoming.find((event) => event.featured) ?? upcoming[0] ?? data[0] ?? null;

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl space-y-14 px-5 py-20 lg:px-8">
        <AnimatedContent direction="left">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <SectionHeading eyebrow="Events" title="Campaigns, drives, and outreach moments with real public value." description="Live event listings are grouped by timing, with featured initiatives surfaced first for quick discovery." />
            <div className="grid gap-3 sm:grid-cols-3">
              <GlassCard className="p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Upcoming</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{upcoming.length}</p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Past</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{past.length}</p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Featured</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{data.filter((event) => event.featured).length}</p>
              </GlassCard>
            </div>
          </div>
        </AnimatedContent>

        {featuredEvent ? (
          <AnimatedContent direction="up">
            <BorderGlow>
              <GlassCard className="overflow-hidden p-0">
                <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                  <img
                    src={featuredEvent.coverImage ?? "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1400&q=80"}
                    alt={featuredEvent.title}
                    className="h-full min-h-[24rem] w-full object-cover"
                  />
                  <div className="space-y-6 p-8 lg:p-10">
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusPill>Featured Event</StatusPill>
                      <StatusPill>{featuredEvent.category}</StatusPill>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-semibold text-slate-950">{featuredEvent.title}</h3>
                      <p className="text-sm leading-7 text-slate-600">{featuredEvent.shortDescription ?? featuredEvent.description.slice(0, 180)}</p>
                    </div>
                    <div className="grid gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-3"><CalendarDays className="h-4 w-4 text-cyan-500" /> {formatEventDate(featuredEvent.eventDate)}</div>
                      <div className="flex items-center gap-3"><Clock3 className="h-4 w-4 text-violet-500" /> {formatEventTime(featuredEvent.startTime, featuredEvent.endTime)}</div>
                      <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-emerald-500" /> {featuredEvent.venue}</div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/events/${featuredEvent.slug}`} className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">
                        View Details
                      </Link>
                      {featuredEvent.registrationLink ? (
                        <a href={featuredEvent.registrationLink} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-slate-200 bg-white/70 px-5 py-3 text-sm font-medium text-slate-900">
                          Register Now
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </BorderGlow>
          </AnimatedContent>
        ) : null}

        <div className="space-y-6">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-500">
            <Sparkles className="h-4 w-4 text-cyan-500" /> Upcoming Events
          </div>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((event) => (
              <AnimatedContent key={event.slug} direction="up">
                <EventCard event={event} />
              </AnimatedContent>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-500">
            <CalendarDays className="h-4 w-4 text-violet-500" /> Past Events
          </div>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {past.map((event) => (
              <AnimatedContent key={event.slug} direction="up">
                <EventCard event={event} />
              </AnimatedContent>
            ))}
          </div>
        </div>

        {upcoming.length === 0 && past.length === 0 ? (
          <GlassCard>
            <p className="text-sm leading-7 text-slate-600">No published events are available yet.</p>
          </GlassCard>
        ) : null}
      </section>
    </SiteShell>
  );
}
