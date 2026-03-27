"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Shield, TerminalSquare } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiFetch } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: ""
  });

  const redirectPath = searchParams.get("redirect") || "/dashboard";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? {
              email: formValues.email,
              password: formValues.password
            }
          : formValues;
      const response = await apiFetch<{ user: AuthUser }>(path, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setUser(response.user);
      router.replace(redirectPath as Route);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to continue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <div className="glass-panel w-full max-w-5xl overflow-hidden rounded-[32px] border border-stroke shadow-panel">
        <div className="grid min-h-[680px] lg:grid-cols-[1.15fr_0.85fr]">
          <section className="flex flex-col justify-between border-b border-stroke px-8 py-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-stroke bg-white/5 px-4 py-2 text-sm text-slate-200">
                <Shield className="h-4 w-4 text-teal-300" />
                Production-grade pentest orchestration
              </div>
              <div className="space-y-4">
                <h1
                  className="max-w-2xl text-4xl font-semibold leading-tight text-white md:text-5xl"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Operate queued security assessments with live telemetry and durable reporting.
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-300">
                  This dashboard combines authenticated job dispatch, BullMQ-backed execution,
                  Socket.IO streaming, and persistent PDF evidence so operators can run and
                  review assessments from one control plane.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Realtime logs", "Stream worker output directly into a terminal-style view."],
                ["Queue-backed jobs", "Decouple long-running work from the operator session."],
                ["Persistent reports", "Store downloadable PDF results for later retrieval."]
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-stroke bg-white/5 p-4">
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex items-center bg-slate-950/45 px-6 py-10 md:px-10">
            <div className="w-full space-y-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">
                  <TerminalSquare className="h-3.5 w-3.5" />
                  {mode === "login" ? "Operator Access" : "Create Workspace"}
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-white">
                    {mode === "login" ? "Sign in to continue" : "Register a new operator"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {mode === "login"
                      ? "Your session is secured with JWT-backed authentication and protected routes."
                      : "Accounts are provisioned with a single user role to keep access simple and controlled."}
                  </p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {mode === "register" ? (
                  <label className="block space-y-2">
                    <span className="text-sm text-slate-300">Full name</span>
                    <input
                      className="w-full rounded-2xl border border-stroke bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
                      placeholder="Narendra Bagaskoro"
                      value={formValues.name}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, name: event.target.value }))
                      }
                    />
                  </label>
                ) : null}

                <label className="block space-y-2">
                  <span className="text-sm text-slate-300">Email</span>
                  <input
                    className="w-full rounded-2xl border border-stroke bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
                    type="email"
                    placeholder="operator@example.com"
                    value={formValues.email}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm text-slate-300">Password</span>
                  <input
                    className="w-full rounded-2xl border border-stroke bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
                    type="password"
                    placeholder={mode === "login" ? "Enter your password" : "Use 8+ chars with mixed case and a number"}
                    value={formValues.password}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, password: event.target.value }))
                    }
                  />
                </label>

                {error ? (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full rounded-2xl bg-gradient-to-r from-teal-400 via-teal-500 to-orange-400 px-4 py-3 font-medium text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  )}
                >
                  {isSubmitting
                    ? mode === "login"
                      ? "Signing in..."
                      : "Creating account..."
                    : mode === "login"
                      ? "Sign in"
                      : "Create account"}
                </button>
              </form>

            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
