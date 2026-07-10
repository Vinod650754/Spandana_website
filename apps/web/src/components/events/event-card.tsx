import Link from "next/link";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import type { EventRecord } from "@/types/event";
import { BorderGlow } from "@/components/effects/border-glow";
import { GlassCard, SecondaryButton, StatusPill } from "@/components/ui/primitives";

export function EventCard({ event }: { event: EventRecord }) {
  return (
    <BorderGlow>
      <GlassCard className="h-full overflow-hidden p-4">
        <div className="group relative overflow-hidden rounded-[1.2rem]">
          <img
            src={event.coverImage ?? "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80"}
            alt={event.title}
            className="h-64 w-full object-cover transition duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
          {event.featured ? <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">Featured</span> : null}
        </div>

        <div className="space-y-4 p-4 pb-2">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-cyan-500" /> {new Date(event.eventDate).toLocaleDateString()}</span>
            <span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-violet-500" /> {event.venue}</span>
          </div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-500">{event.category}</p>
          <h3 className="text-2xl font-semibold text-slate-950">{event.title}</h3>
          <p className="text-sm leading-7 text-slate-600">{event.shortDescription ?? event.description.slice(0, 140)}</p>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill>{event.status}</StatusPill>
            {event.registrationLink ? (
              <a href={event.registrationLink} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">
                Register
              </a>
            ) : (
              <Link href={`/events/${event.slug}`} className="inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">
                View Details
              </Link>
            )}
            <SecondaryButton href={`/events/${event.slug}`}>View Details</SecondaryButton>
          </div>
        </div>
      </GlassCard>
    </BorderGlow>
  );
}
