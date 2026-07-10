"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedContent } from "@/components/effects/animated-content";
import { BorderGlow } from "@/components/effects/border-glow";
import { GlassCard, SectionHeading } from "@/components/ui/primitives";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials.");
      }

      const data = await response.json();
      localStorage.setItem("adminToken", data.token);
      router.push("/admin/dashboard");
    } catch {
      setStatus("error");
      setMessage("Sign in failed. Check the admin credentials and try again.");
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
      <AnimatedContent direction="up">
        <SectionHeading eyebrow="Admin Login" title="Separate secure route for content managers." description="The public site never links to authentication; this route is reserved for admin access only." />
      </AnimatedContent>
      <div className="mt-10">
        <AnimatedContent direction="up">
          <BorderGlow>
            <GlassCard>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                  placeholder="Admin email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <input
                  type="password"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "loading" ? "Signing In..." : "Sign In"}
                </button>
                {status === "error" ? <p className="text-sm text-red-600">{message}</p> : null}
              </form>
            </GlassCard>
          </BorderGlow>
        </AnimatedContent>
      </div>
    </section>
  );
}
