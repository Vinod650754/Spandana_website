"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Instagram, Linkedin, Link as LinkIcon, Mail, MapPinned, MessageCircle, Phone } from "lucide-react";
import { AnimatedContent } from "@/components/effects/animated-content";
import { BorderGlow } from "@/components/effects/border-glow";
import { SiteShell } from "@/components/layout/site-shell";
import { GlassCard, SectionHeading } from "@/components/ui/primitives";
import type { ContactSettings } from "@/types/contact";

type ContactPageViewProps = {
  settings: ContactSettings | null;
};

type FormState = {
  name: string;
  email: string;
  message: string;
};

const fallbackSettings: ContactSettings = {
  email: "spandana@smvit.edu.in",
  phone: "+91 90000 00000",
  whatsapp: "https://wa.me/919000000000",
  instagram: "https://instagram.com/spandana.smvit",
  linkedin: "https://linkedin.com/company/spandana-smvit",
  youtube: null,
  facebook: null,
  mapsUrl: "https://maps.google.com",
  address: "Sir M Visvesvaraya Institute of Technology, Bengaluru",
  officeHours: null,
  contactFormEnabled: true,
  successMessage: "Thank you for reaching out. We will get back to you soon.",
};

const emptyForm: FormState = {
  name: "",
  email: "",
  message: "",
};

function displayUrl(value: string | null, fallback: string) {
  if (!value) {
    return fallback;
  }

  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function ContactPageView({ settings }: ContactPageViewProps) {
  const contactSettings = settings ?? fallbackSettings;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const contacts = useMemo(
    () =>
      [
        { icon: Mail, label: "Email", value: contactSettings.email },
        { icon: Phone, label: "Phone", value: contactSettings.phone },
        { icon: MessageCircle, label: "WhatsApp", value: displayUrl(contactSettings.whatsapp, "Chat for volunteer updates") },
        { icon: Instagram, label: "Instagram", value: displayUrl(contactSettings.instagram, "@spandana.smvit") },
        { icon: Linkedin, label: "LinkedIn", value: displayUrl(contactSettings.linkedin, "Spandana Club") },
        { icon: MapPinned, label: "Google Maps", value: contactSettings.address || displayUrl(contactSettings.mapsUrl, "SMVIT Campus") },
        contactSettings.youtube ? { icon: LinkIcon, label: "YouTube", value: displayUrl(contactSettings.youtube, "YouTube") } : null,
        contactSettings.facebook ? { icon: LinkIcon, label: "Facebook", value: displayUrl(contactSettings.facebook, "Facebook") } : null,
        contactSettings.officeHours ? { icon: LinkIcon, label: "Office Hours", value: contactSettings.officeHours } : null,
      ].filter((contact): contact is { icon: typeof Mail; label: string; value: string } => Boolean(contact)),
    [contactSettings]
  );

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || !contactSettings.contactFormEnabled) {
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to submit message.");
      }

      setForm(emptyForm);
      setMessage(contactSettings.successMessage);
    } catch {
      setError("Unable to send your message right now. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <AnimatedContent direction="left">
          <SectionHeading eyebrow="Contact" title="A modern glass contact surface for partners, volunteers, and the campus community." description="The contact page keeps every channel visible, simple, and direct." />
        </AnimatedContent>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <AnimatedContent direction="left">
            <BorderGlow>
              <GlassCard>
                <div className="grid gap-4 sm:grid-cols-2">
                  {contacts.map((contact) => (
                    <div key={contact.label} className="glass-panel rounded-[1.2rem] p-4">
                      <contact.icon className="h-5 w-5 text-cyan-500" />
                      <p className="mt-3 text-xs uppercase tracking-[0.35em] text-slate-500">{contact.label}</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{contact.value}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </BorderGlow>
          </AnimatedContent>

          <AnimatedContent direction="right">
            <BorderGlow>
              <GlassCard>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-500">Write to us</p>
                {contactSettings.contactFormEnabled ? (
                  <form className="mt-5 grid gap-4" onSubmit={submitMessage}>
                    <input
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      disabled={submitting}
                      required
                    />
                    <input
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                      placeholder="Email address"
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      disabled={submitting}
                      required
                    />
                    <textarea
                      className="min-h-36 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                      placeholder="How can we help?"
                      value={form.message}
                      onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                      disabled={submitting}
                      required
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Sending..." : "Send Message"}
                    </button>
                    {message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p> : null}
                    {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : null}
                  </form>
                ) : (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    Contact form submissions are currently closed. Please use the contact channels listed here.
                  </div>
                )}
              </GlassCard>
            </BorderGlow>
          </AnimatedContent>
        </div>
      </section>
    </SiteShell>
  );
}
