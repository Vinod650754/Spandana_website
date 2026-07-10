import { notFound } from "next/navigation";
import { CalendarDays, Clock3, MapPin, Sparkles } from "lucide-react";
import { AnimatedContent } from "@/components/effects/animated-content";
import { BorderGlow } from "@/components/effects/border-glow";
import { SiteShell } from "@/components/layout/site-shell";
import { GlassCard, SectionHeading, SecondaryButton, StatusPill } from "@/components/ui/primitives";
import { fetchPublishedEvent } from "@/lib/events-api";
import type { EventRecord } from "@/types/event";

export const dynamic = "force-dynamic";

function formatEventDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function EventDetailsPage({ params }: { params: { slug: string } }) {
  let event: EventRecord;

  try {
    const response = await fetchPublishedEvent(params.slug);
    event = response.data;
  } catch (error) {
    if (error instanceof Error && error.message === "not-found") {
      notFound();
    }

    throw error;
  }

  const galleryImages = event.galleryImages ?? [];

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl space-y-10 px-5 py-20 lg:px-8">
        <AnimatedContent direction="up">
          <BorderGlow>
            <GlassCard className="overflow-hidden p-0">
              <img
                src={event.coverImage ?? "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1600&q=80"}
                alt={event.title}
                className="h-[28rem] w-full object-cover"
              />
              <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
                <div>
                  <div className="mb-5 flex flex-wrap gap-3">
                    <StatusPill>{event.category}</StatusPill>
                    {event.featured ? <StatusPill>Featured</StatusPill> : null}
                  </div>
                  <SectionHeading
                    eyebrow="Event Details"
                    title={event.title}
                    description={event.shortDescription ?? event.description.slice(0, 200)}
                  />
                  <div className="mt-6 grid gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-3"><CalendarDays className="h-4 w-4 text-cyan-500" /> {formatEventDate(event.eventDate)}</div>
                    <div className="flex items-center gap-3"><Clock3 className="h-4 w-4 text-violet-500" /> {event.startTime && event.endTime ? `${event.startTime} - ${event.endTime}` : event.startTime ?? event.endTime ?? "Time to be announced"}</div>
                    <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-emerald-500" /> {event.venue}</div>
                  </div>
                  <p className="mt-6 text-sm leading-7 text-slate-600">{event.description}</p>
                  <div className="mt-6 flex flex-wrap gap-4">
                    {event.registrationLink ? (
                      <a href={event.registrationLink} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">
                        Register Now
                      </a>
                    ) : null}
                    <SecondaryButton href="/events">Back to Events</SecondaryButton>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-[1.3rem] border border-slate-200 bg-white/70 p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Status</p>
                    <p className="mt-2 text-lg font-medium text-slate-950">{event.status}</p>
                  </div>
                  <div className="rounded-[1.3rem] border border-slate-200 bg-white/70 p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Gallery</p>
                    <p className="mt-2 text-lg font-medium text-slate-950">{galleryImages.length} images</p>
                  </div>
                  <div className="rounded-[1.3rem] border border-slate-200 bg-white/70 p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Display Order</p>
                    <p className="mt-2 text-lg font-medium text-slate-950">{event.displayOrder}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </BorderGlow>
        </AnimatedContent>

        {galleryImages.length > 0 ? (
          <AnimatedContent direction="up">
            <div className="space-y-5">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-500">
                <Sparkles className="h-4 w-4 text-cyan-500" /> Gallery
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {galleryImages.map((image) => (
                  <img key={image.public_id} src={image.url} alt={event.title} className="h-64 w-full rounded-[1.4rem] object-cover shadow-[0_12px_32px_rgba(15,23,42,0.08)]" />
                ))}
              </div>
            </div>
          </AnimatedContent>
        ) : null}
      </section>
    </SiteShell>
  );
}
