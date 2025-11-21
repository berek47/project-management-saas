import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "./redux";
import { setIsDarkMode } from "@/state";
import { supabase } from "@/lib/supabase";
import { isPreviewAuthMode } from "@/state/api";
import {
  ArrowRight,
  CheckCircle2,
  Command,
  Eye,
  EyeOff,
  Gauge,
  LockKeyhole,
  Moon,
  Orbit,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const usernameInputRef = useRef<HTMLInputElement | null>(null);
  const [session, setSession] = useState<Awaited<
    ReturnType<typeof supabase.auth.getSession>
  >["data"]["session"] | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (isPreviewAuthMode) return;

    let isMounted = true;

    const syncSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (isMounted) {
        setSession(currentSession);
        setIsLoading(false);
      }
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isPreviewAuthMode) {
    return (
      <div>
        <div className="glass-panel mx-4 mt-4 rounded-2xl border border-sand-100 px-4 py-3 text-sm text-slate-700 dark:border-stroke-dark dark:text-slate-200">
          Preview mode is active. Authentication is temporarily bypassed so you
          can work on the UI and branding.
        </div>
        {children}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-panel w-full max-w-md rounded-3xl p-8 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Loading authentication...
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      if (mode === "sign-up") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });

        if (signUpError) throw signUpError;

        setMessage(
          "Sign-up complete. If email confirmation is enabled in Supabase, confirm your email before signing in.",
        );
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message === "Failed to fetch"
            ? "Could not reach Supabase. Double-check the project URL and make sure you copied the full publishable key."
            : submitError.message
          : "Authentication failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (session) {
    return <div>{children}</div>;
  }

  const title =
    mode === "sign-in"
      ? "Return to your operating console"
      : "Build your workspace command center";
  const subtitle =
    mode === "sign-in"
      ? "Resume planning, sprint coordination, and delivery tracking from one live surface."
      : "Create a polished project workspace with secure auth, team visibility, and real-time execution signals.";
  const formButtonLabel =
    mode === "sign-in" ? "Enter Workspace" : "Create Account";
  const focusPrimaryField = () => {
    const target = mode === "sign-up" ? usernameInputRef.current : emailInputRef.current;
    target?.focus();
  };

  return (
    <div className="auth-shell relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-10">
      <div className="auth-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="auth-orb auth-orb-cyan" />
      <div className="auth-orb auth-orb-amber" />
      <div className="auth-orb auth-orb-indigo" />

      <button
        aria-label="Toggle dark mode"
        className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-700 shadow-sm shadow-slate-200/60 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 sm:right-6 sm:top-6"
        onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
        type="button"
      >
        {isDarkMode ? (
          <Sun className="h-3.5 w-3.5 text-amber-500" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-slate-700" />
        )}
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </button>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <section className="glass-panel auth-panel-border relative overflow-hidden rounded-[2rem] p-7 sm:p-10 lg:min-h-[720px] lg:p-12">
            <div className="auth-panel-glow absolute inset-x-0 top-0 h-40" />
            <div className="auth-diagram absolute right-8 top-8 hidden xl:block">
              <div className="auth-diagram-node auth-node-core">
                <Command className="h-4 w-4" />
              </div>
              <div className="auth-diagram-link auth-link-a" />
              <div className="auth-diagram-link auth-link-b" />
              <div className="auth-diagram-link auth-link-c" />
              <div className="auth-diagram-node auth-node-a">
                <Gauge className="h-3.5 w-3.5" />
              </div>
              <div className="auth-diagram-node auth-node-b">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div className="auth-diagram-node auth-node-c">
                <RadioTower className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="relative flex h-full flex-col justify-between gap-10">
              <div className="space-y-8">
                <div className="auth-rise flex flex-wrap items-center gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-700 shadow-sm shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                      <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                      Workspace OS
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/15 bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-700 dark:text-teal-200">
                      <Orbit className="h-3.5 w-3.5" />
                      Modern project control
                    </div>
                  </div>
                </div>

                <div className="auth-rise auth-delay-1 max-w-2xl space-y-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                    Project Workspace
                  </p>
                  <h1 className="auth-hero-heading max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.07em] text-slate-950 dark:text-white sm:text-5xl lg:text-[4.45rem]">
                    {title}
                  </h1>
                  <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                    {subtitle}
                  </p>
                </div>

                <div className="grid gap-4 min-[1900px]:grid-cols-[1.35fr_0.95fr]">
                  <div className="auth-rise auth-delay-2 rounded-[1.85rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                          Live Command Surface
                        </p>
                        <p className="mt-3 max-w-md text-2xl font-semibold leading-tight tracking-[-0.04em]">
                          See execution, risk, and delivery pressure before the
                          first click inside.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <Gauge className="h-5 w-5 text-teal-300" />
                      </div>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 min-[1900px]:grid-cols-3">
                      {[
                        [
                          "Visibility",
                          "360°",
                          "Live project, team, and delivery status in one surface.",
                        ],
                        [
                          "Cadence",
                          "Real-time",
                          "Stay aligned across priorities, dependencies, and execution.",
                        ],
                        [
                          "Access",
                          "Secure",
                          "Managed authentication with a deliberate, premium entry point.",
                        ],
                      ].map(([label, value, copy]) => (
                        <div
                          className="min-w-0 rounded-[1.45rem] border border-white/10 bg-white/6 p-4 backdrop-blur"
                          key={label}
                        >
                          <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                            {label}
                          </p>
                          <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.05em] sm:text-3xl">
                            {value}
                          </p>
                          <p className="mt-3 text-sm leading-6 text-white/72">
                            {copy}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 min-[1900px]:grid-cols-1">
                    <div className="auth-rise auth-delay-3 rounded-[1.6rem] border border-white/60 bg-white/78 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                          Identity Layer
                        </p>
                        <ShieldCheck className="h-4.5 w-4.5 text-teal-500" />
                      </div>
                      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                        Session-aware access
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Premium sign-in flow with persistent sessions and
                        controlled workspace entry.
                      </p>
                    </div>

                    <div className="auth-rise auth-delay-4 rounded-[1.6rem] border border-white/60 bg-white/78 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                          Momentum
                        </p>
                        <Zap className="h-4.5 w-4.5 text-amber-500" />
                      </div>
                      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                        Fast to first action
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Open the app and move straight from authentication into
                        planning, search, and execution.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 min-[1900px]:grid-cols-[1.2fr_0.8fr]">
                <div className="auth-rise auth-delay-3 rounded-[1.8rem] border border-slate-200/70 bg-slate-950 p-6 text-white shadow-[0_24px_60px_rgba(2,6,23,0.24)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                        Launch Layer
                      </p>
                      <p className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                        Built for deliberate operators
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <LockKeyhole className="h-5 w-5 text-teal-300" />
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    {[
                      "Track projects, workload, and sprint pressure without context switching.",
                      "Keep sign-in, identity, and workspace access inside one clean flow.",
                      "Move from entry to execution with a dashboard that already feels live.",
                    ].map((item) => (
                      <div
                        className="flex items-start gap-3 text-sm leading-6 text-white/78"
                        key={item}
                      >
                        <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-teal-300" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="auth-rise auth-delay-4 rounded-[1.8rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                    Access profile
                  </p>
                  <div className="mt-5 space-y-4">
                    {[
                      ["Authentication", "Supabase-backed"],
                      ["Experience", "Premium local demo"],
                      ["Security", "Session-aware access"],
                    ].map(([label, value]) => (
                      <div
                        className="grid gap-1 rounded-2xl border border-slate-200/80 px-4 py-3 dark:border-white/10"
                        key={label}
                      >
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {label}
                        </span>
                        <span className="break-words text-sm font-semibold text-slate-900 dark:text-white">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel auth-panel-border auth-form-panel relative overflow-hidden rounded-[2rem] p-6 shadow-[0_36px_120px_rgba(15,23,42,0.12)] sm:p-8 lg:p-9">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-teal-400/12 via-transparent to-transparent" />
            <div className="absolute right-0 top-20 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />
            <div className="auth-form-grid absolute inset-0 opacity-70" />
            <div className="auth-form-rings absolute right-[-5rem] top-[-2rem] h-56 w-56 rounded-full" />
            <div className="auth-form-rings auth-form-rings-secondary absolute bottom-[-6rem] left-[-4rem] h-52 w-52 rounded-full" />

            <div className="relative flex h-full flex-col justify-center">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-300">
                      Secure Access
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white">
                      {mode === "sign-in"
                        ? "Enter the workspace"
                        : "Create your access"}
                    </h2>
                  </div>
                  <button
                    aria-label={
                      mode === "sign-in"
                        ? "Focus the email sign-in field"
                        : "Focus the username sign-up field"
                    }
                    className="auth-pulse-ring flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-500/15 bg-teal-500/10 text-teal-700 transition hover:bg-teal-500/20 dark:text-teal-200"
                    onClick={focusPrimaryField}
                    type="button"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-4 grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.45rem] border border-slate-200/80 bg-white/82 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">
                      Identity Status
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.75)]" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        Secure channel ready
                      </span>
                    </div>
                  </div>
                  <div className="rounded-[1.45rem] border border-slate-200/80 bg-white/82 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">
                      Workspace Sync
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="auth-signal-bars flex items-end gap-1">
                        <span />
                        <span />
                        <span />
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        Live access routing
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-5 rounded-[1.6rem] border border-slate-200/80 bg-white/78 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                      <LockKeyhole className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                        Access Sequence
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                        {mode === "sign-in"
                          ? "Authenticate and continue where you left off."
                          : "Create your identity, then step directly into the workspace."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <button
                    className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                      mode === "sign-in"
                        ? "bg-slate-950 text-white shadow-[0_16px_30px_rgba(15,23,42,0.2)] dark:bg-white dark:text-slate-950"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    }`}
                    onClick={() => setMode("sign-in")}
                    type="button"
                  >
                    Sign In
                  </button>
                  <button
                    className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                      mode === "sign-up"
                        ? "bg-slate-950 text-white shadow-[0_16px_30px_rgba(15,23,42,0.2)] dark:bg-white dark:text-slate-950"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    }`}
                    onClick={() => setMode("sign-up")}
                    type="button"
                  >
                    Sign Up
                  </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {mode === "sign-up" && (
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                        Username
                      </span>
                      <input
                        className="auth-input w-full rounded-[1.4rem] border border-slate-200/80 bg-white/92 px-4 py-4 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:shadow-[0_0_0_4px_rgba(45,212,191,0.14)] dark:border-white/10 dark:bg-slate-950/30 dark:text-white"
                        placeholder="Choose a visible workspace name"
                        ref={usernameInputRef}
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                      />
                    </label>
                  )}

                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      Email
                    </span>
                    <input
                      className="auth-input w-full rounded-[1.4rem] border border-slate-200/80 bg-white/92 px-4 py-4 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:shadow-[0_0_0_4px_rgba(45,212,191,0.14)] dark:border-white/10 dark:bg-slate-950/30 dark:text-white"
                      placeholder="name@company.com"
                      ref={emailInputRef}
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      Password
                    </span>
                    <div className="relative">
                      <input
                        className="auth-input w-full rounded-[1.4rem] border border-slate-200/80 bg-white/92 px-4 py-4 pr-12 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:shadow-[0_0_0_4px_rgba(45,212,191,0.14)] dark:border-white/10 dark:bg-slate-950/30 dark:text-white"
                        placeholder="Use a secure password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                      />
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                        onClick={() => setShowPassword((current) => !current)}
                        type="button"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </label>

                  {error && (
                    <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm leading-6 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                      {error}
                    </div>
                  )}
                  {message && (
                    <div className="rounded-[1.4rem] border border-teal-200 bg-teal-50/90 px-4 py-3 text-sm leading-6 text-teal-800 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-100">
                      {message}
                    </div>
                  )}

                  <button
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-slate-950 px-4 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-[0_22px_50px_rgba(13,148,136,0.28)] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-300"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    <span className="auth-button-sheen" />
                    <span>{isSubmitting ? "Please wait..." : formButtonLabel}</span>
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </button>
                </form>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      Session
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                      Persistent access across refresh and workspace routing.
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      Access Layer
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                      Designed to feel premium before the first click inside the
                      app.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AuthProvider;
