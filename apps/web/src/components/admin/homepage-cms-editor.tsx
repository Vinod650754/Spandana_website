"use client";

import { useEffect, useState } from "react";
import { Eye, RefreshCw, Save } from "lucide-react";
import { BorderGlow } from "@/components/effects/border-glow";
import { ShinyText } from "@/components/effects/shiny-text";
import { ActionButton, GlassCard, SecondaryButton } from "@/components/ui/primitives";
import type { HomepageButton, HomepageContent, HomepageFeaturedSection, HomepageImpactCounter } from "@/types/homepage";

type Status = "idle" | "loading" | "saving" | "success" | "error";

const emptyContent: HomepageContent = {
  hero: {
    title: "",
    subtitle: "",
    body: "",
    buttons: [
      { label: "", url: "", variant: "primary" },
      { label: "", url: "", variant: "secondary" },
    ],
    rotatingLines: [""],
    chips: [],
  },
  impact: [{ label: "", value: 0, suffix: "" }],
  featuredSections: [{ title: "", description: "" }],
  heroBackground: {
    type: "reactbits",
    effects: [
      "Liquid Ether Background",
      "Pixel Trail Cursor",
      "Glassmorphism Elements",
      "Border Glow Components",
      "Animated Content",
      "Bounce Cards",
      "Shiny Text",
      "Text Type Animations",
    ],
  },
};

function getToken() {
  return typeof window === "undefined" ? null : localStorage.getItem("adminToken");
}

export function HomepageCmsEditor() {
  const [content, setContent] = useState<HomepageContent>(emptyContent);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const loadContent = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/home`, { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load homepage content.");
      const data = await response.json();
      setContent(data.data);
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("Unable to load homepage content.");
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(loadContent, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const updateHero = (field: keyof HomepageContent["hero"], value: string | string[] | HomepageButton[]) => {
    setContent((current) => ({
      ...current,
      hero: { ...current.hero, [field]: value },
    }));
  };

  const updateButton = (index: number, field: keyof HomepageButton, value: string) => {
    const buttons = content.hero.buttons.map((button, buttonIndex) =>
      buttonIndex === index ? { ...button, [field]: value } : button
    );
    updateHero("buttons", buttons);
  };

  const updateImpact = (index: number, field: keyof HomepageImpactCounter, value: string) => {
    setContent((current) => ({
      ...current,
      impact: current.impact.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: field === "value" ? Number(value) : value }
          : item
      ),
    }));
  };

  const updateFeaturedSection = (index: number, field: keyof HomepageFeaturedSection, value: string) => {
    setContent((current) => ({
      ...current,
      featuredSections: current.featuredSections.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addRotatingLine = () => updateHero("rotatingLines", [...content.hero.rotatingLines, ""]);
  const addChip = () => updateHero("chips", [...content.hero.chips, ""]);
  const addImpact = () => setContent((current) => ({ ...current, impact: [...current.impact, { label: "", value: 0, suffix: "" }] }));
  const addFeaturedSection = () => setContent((current) => ({ ...current, featuredSections: [...current.featuredSections, { title: "", description: "" }] }));

  const saveContent = async () => {
    const token = getToken();

    if (!token) {
      setStatus("error");
      setMessage("Please sign in before saving homepage content.");
      return;
    }

    setStatus("saving");
    setMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/home`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message ?? "Failed to save homepage content.");
      }

      const data = await response.json();
      setContent(data.data);
      setStatus("success");
      setMessage("Homepage content saved successfully.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to save homepage content.");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <GlassCard>
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-500">Homepage CMS</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">Hero Content</h3>
              </div>
              <div className="flex gap-3">
                <ActionButton onClick={loadContent} disabled={status === "loading" || status === "saving"} className="gap-2 bg-cyan-700 hover:bg-cyan-800">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </ActionButton>
                <ActionButton onClick={saveContent} disabled={status === "saving"} className="gap-2">
                  <Save className="h-4 w-4" />
                  {status === "saving" ? "Saving..." : "Save"}
                </ActionButton>
              </div>
            </div>

            {message ? (
              <p className={`rounded-lg border p-3 text-sm ${status === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
                {message}
              </p>
            ) : null}

            <label className="grid gap-2 text-sm font-medium text-slate-900">
              Hero Title
              <input value={content.hero.title} onChange={(event) => updateHero("title", event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-300" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-900">
              Hero Subtitle
              <input value={content.hero.subtitle} onChange={(event) => updateHero("subtitle", event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-300" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-900">
              Hero Body
              <textarea value={content.hero.body} onChange={(event) => updateHero("body", event.target.value)} className="min-h-32 rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-300" />
            </label>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-950">Hero Buttons</h3>
            {content.hero.buttons.map((button, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_10rem]">
                <input value={button.label} onChange={(event) => updateButton(index, "label", event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-300" />
                <input value={button.url} onChange={(event) => updateButton(index, "url", event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-300" />
                <select value={button.variant} onChange={(event) => updateButton(index, "variant", event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-300">
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </select>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-950">Rotating Lines</h3>
              <button type="button" onClick={addRotatingLine} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium">Add Line</button>
            </div>
            {content.hero.rotatingLines.map((line, index) => (
              <input
                key={index}
                value={line}
                onChange={(event) => {
                  const lines = [...content.hero.rotatingLines];
                  lines[index] = event.target.value;
                  updateHero("rotatingLines", lines);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-300"
              />
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-950">Hero Chips</h3>
              <button type="button" onClick={addChip} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium">Add Chip</button>
            </div>
            {content.hero.chips.map((chip, index) => (
              <input
                key={index}
                value={chip}
                onChange={(event) => {
                  const chips = [...content.hero.chips];
                  chips[index] = event.target.value;
                  updateHero("chips", chips);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-300"
              />
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-950">Impact Counters</h3>
              <button type="button" onClick={addImpact} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium">Add Counter</button>
            </div>
            {content.impact.map((item, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-[1fr_8rem_6rem]">
                <input value={item.label} onChange={(event) => updateImpact(index, "label", event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-300" />
                <input type="number" value={item.value} onChange={(event) => updateImpact(index, "value", event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-300" />
                <input value={item.suffix} onChange={(event) => updateImpact(index, "suffix", event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-300" />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-950">Featured Section Cards</h3>
              <button type="button" onClick={addFeaturedSection} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium">Add Card</button>
            </div>
            {content.featuredSections.map((item, index) => (
              <div key={index} className="grid gap-3">
                <input value={item.title} onChange={(event) => updateFeaturedSection(index, "title", event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-300" />
                <textarea value={item.description} onChange={(event) => updateFeaturedSection(index, "description", event.target.value)} className="min-h-20 rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-300" />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <BorderGlow>
          <GlassCard>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-500">
              <Eye className="h-4 w-4" />
              Preview
            </div>
            <div className="mt-6 space-y-5">
              <h2 className="text-5xl font-semibold tracking-tight text-slate-950">
                <ShinyText>{content.hero.title || "Untitled"}</ShinyText>
              </h2>
              <p className="text-lg font-medium text-slate-700">{content.hero.subtitle}</p>
              <p className="text-sm leading-7 text-slate-600">{content.hero.body}</p>
              <div className="flex flex-wrap gap-2">
                {content.hero.buttons.map((button, index) => (
                  <span key={index} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700">{button.label || "Button"}</span>
                ))}
              </div>
            </div>
          </GlassCard>
        </BorderGlow>
        <SecondaryButton href="/">Open Homepage</SecondaryButton>
      </div>
    </div>
  );
}
