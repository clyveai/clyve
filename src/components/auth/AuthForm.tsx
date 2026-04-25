"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

const fallbackNameFromEmail = (emailValue: string) => {
  const localPart = emailValue.trim().split("@")[0];
  return localPart.length > 0 ? localPart : "member";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLogin = mode === "login";

  const handleEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/dashboard",
        });

        if (response.error) {
          throw new Error(response.error.message ?? "Unable to sign in.");
        }
      } else {
        const response = await authClient.signUp.email({
          email,
          password,
          // UI tetap hanya email + password; name diisi otomatis untuk kompatibilitas auth provider.
          name: fallbackNameFromEmail(email),
          callbackURL: "/dashboard",
        });

        if (response.error) {
          throw new Error(response.error.message ?? "Unable to register.");
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (response.error) {
        throw new Error(response.error.message ?? "Unable to continue with Google.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Google sign-in failed.");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-[440px] rounded-3xl border border-white/10 bg-zinc-950/55 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8"
    >
      <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
        {isLogin ? "Welcome Back" : "Create Your Account"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        {isLogin
          ? "Access your workspace and continue generating premium smart prompts."
          : "Start building cinematic-grade smart prompts for your business."}
      </p>

      <form onSubmit={handleEmailAuth} className="mt-7 space-y-3.5">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="h-11 w-full rounded-xl border border-transparent bg-white/[0.02] px-4 text-sm text-white placeholder:text-zinc-500 outline-none ring-1 ring-white/10 transition will-change-transform focus:bg-white/[0.03] focus:ring-2 focus:ring-[#72a7ff] focus:shadow-[0_0_26px_rgba(95,157,255,0.24)]"
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="h-11 w-full rounded-xl border border-transparent bg-white/[0.02] px-4 text-sm text-white placeholder:text-zinc-500 outline-none ring-1 ring-white/10 transition will-change-transform focus:bg-white/[0.03] focus:ring-2 focus:ring-[#72a7ff] focus:shadow-[0_0_26px_rgba(95,157,255,0.24)]"
        />

        {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isLogin ? "Sign In" : "Create Account"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        <span className="h-px flex-1 bg-white/10" />
        Or
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={isLoading}
        className="flex h-11 w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] text-sm font-medium text-zinc-100 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-zinc-400">
        {isLogin ? "No account yet?" : "Already have an account?"}{" "}
        <Link href={isLogin ? "/register" : "/login"} className="font-medium text-white underline underline-offset-4">
          {isLogin ? "Register" : "Sign in"}
        </Link>
      </p>
    </motion.div>
  );
}
