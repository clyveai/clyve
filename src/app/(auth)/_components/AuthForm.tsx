"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, MotionProps } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authClient } from "@/infrastructure/auth/auth-client";

type AuthMode = "login" | "signup";

const fallbackNameFromEmail = (email: string) => email.trim().split("@")[0] || "member";

const FADE: MotionProps["transition"] = { duration: 0.4, ease: "easeOut" };

const COPY: Record<AuthMode, { title: string; subtitle: string; cta: string; switchLabel: string; switchCta: string; switchHref: string }> = {
  login: {
    title: "Welcome back",
    subtitle: "Your thesis is where you left it.",
    cta: "Sign in",
    switchLabel: "New here?",
    switchCta: "Create an account",
    switchHref: "/signup",
  },
  signup: {
    title: "Track your thesis",
    subtitle: "Clyve remembers why, and flags when it stops holding.",
    cta: "Create account",
    switchLabel: "Already have an account?",
    switchCta: "Sign in",
    switchHref: "/login",
  },
};

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "login";
  const { title, subtitle, cta, switchLabel, switchCta, switchHref } = COPY[mode];

  const fadeIn: MotionProps = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: FADE };

  const runAuth = async (action: () => Promise<{ error?: { message?: string } | null }>) => {
    setError(null);
    setIsLoading(true);
    try {
      const { error: authError } = await action();
      if (authError) throw new Error(authError.message ?? "Authentication failed.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runAuth(() =>
      isLogin
        ? authClient.signIn.email({ email, password, callbackURL: "/dashboard" })
        : authClient.signUp.email({ email, password, name: fallbackNameFromEmail(email), callbackURL: "/dashboard" })
    );
  };

  const handleGoogle = () =>
    runAuth(() => authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" }));

  return (
    <div className="flex w-full max-w-[440px] flex-col items-center px-4 sm:px-0">
      <motion.div {...fadeIn} className="mb-6 sm:mb-8">
        <Link href="/" className="block transition-transform hover:scale-105 active:scale-95">
          <Image src="/logo-auth.svg" alt="Clyve" width={44} height={44} className="h-10 w-auto sm:h-12" priority />
        </Link>
      </motion.div>

      <motion.div
        {...fadeIn}
        className="w-full rounded-3xl border border-[var(--border-color)] bg-[#111111]/55 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8"
      >
        <h1 className="text-xl font-semibold tracking-tight text-[var(--fg-primary)] sm:text-2xl">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--fg-secondary)]">{subtitle}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5 sm:mt-7">
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="input-dark h-11 w-full rounded-xl px-4 text-[16px] focus:border-white/80 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)] sm:text-sm"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-dark h-11 w-full rounded-xl px-4 pr-11 text-[16px] focus:border-white/80 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)] sm:text-sm"
            />
            {password.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-secondary)] transition-colors hover:text-[var(--fg-primary)]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>

          {error && <p className="text-sm text-accent">{error}</p>}

          <button type="submit" disabled={isLoading} className="btn-primary h-11 w-full text-sm">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : cta}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[var(--fg-secondary)]">
          <span className="h-px flex-1 bg-[var(--border-color)]" />
          Or
          <span className="h-px flex-1 bg-[var(--border-color)]" />
        </div>

        <button type="button" onClick={handleGoogle} disabled={isLoading} className="btn-secondary h-11 w-full text-sm">
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-[var(--fg-secondary)]">
          {switchLabel}{" "}
          <Link href={switchHref} className="font-medium text-[var(--fg-primary)]">
            {switchCta}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}