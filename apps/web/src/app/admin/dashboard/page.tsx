"use client";

import { useEffect, useState } from "react";
import { AnimatedContent } from "@/components/effects/animated-content";
import { BorderGlow } from "@/components/effects/border-glow";
import { GlassCard, SectionHeading } from "@/components/ui/primitives";

type DashboardMetrics = {
  registrations: number;
  galleryUploads: number;
  activeEvents: number;
  volunteerConversions: number;
};

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      queueMicrotask(() => setError("Sign in is required to view dashboard metrics."));
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load metrics.");
        return response.json();
      })
      .then((data) => setMetrics(data))
      .catch(() => setError("Unable to load dashboard metrics."));
  }, []);

  const cards = [
    ["Registrations", String(metrics?.registrations ?? 0)],
    ["Gallery Images", String(metrics?.galleryUploads ?? 0)],
    ["Active Events", String(metrics?.activeEvents ?? 0)],
    ["Volunteer Conversion", `${Math.round((metrics?.volunteerConversions ?? 0) * 100)}%`],
  ];

  return (
    <section className="space-y-8">
      <AnimatedContent direction="left">
        <SectionHeading eyebrow="Dashboard" title="Analytics, content controls, and operational visibility." description="This screen is designed as the command center for the club's digital operations." />
      </AnimatedContent>
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <AnimatedContent key={label} direction="up">
            <BorderGlow>
              <GlassCard>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{label}</p>
                <p className="mt-3 text-4xl font-semibold text-slate-950">{value}</p>
              </GlassCard>
            </BorderGlow>
          </AnimatedContent>
        ))}
      </div>
    </section>
  );
}
