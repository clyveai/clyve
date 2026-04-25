"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Library, Moon } from "lucide-react";
import AmbientGlow from "@/components/dashboard/AmbientGlow";
import AvatarDropdown from "@/components/dashboard/AvatarDropdown";

type DashboardUser = {
  name: string | null;
  email: string | null;
};

export default function DashboardPage() {
  const [promptInput, setPromptInput] = useState("");
  const [user, setUser] = useState<DashboardUser>({ name: null, email: null });

  useEffect(() => {
    let ignore = false;
    const loadUser = async () => {
      const response = await fetch("/api/account", { cache: "no-store" });
      if (!response.ok || ignore) return;
      const payload = (await response.json()) as { user: DashboardUser };
      setUser(payload.user);
    };
    void loadUser();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <AmbientGlow />

      <header className="fixed inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="text-sm font-semibold uppercase tracking-[0.26em] text-zinc-100">
            Clyve
          </Link>
          <AvatarDropdown name={user.name} email={user.email} />
        </div>
      </header>

      <main className="relative z-10 flex min-h-screen flex-col px-4 pb-8 pt-24 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
          <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
            <Moon className="h-3.5 w-3.5 text-amber-300" />
            This feature is coming soon!
            <span className="mx-1 text-zinc-700">•</span>
            <Library className="h-3.5 w-3.5 text-blue-300" />
            My Library Soon
          </div>

          <div className="flex flex-1 items-center justify-center">
            <motion.h1
              initial={{ opacity: 0.65, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative text-5xl font-semibold tracking-[-0.05em] text-zinc-200 sm:text-7xl md:text-8xl lg:text-9xl"
              style={{
                background:
                  "linear-gradient(120deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.7) 46%, rgba(255,220,168,0.72) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              CLYVE AI
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_50%,rgba(255,200,130,0.26),transparent_52%)] blur-xl" />
            </motion.h1>
          </div>

          <div className="mb-4 flex justify-center">
            <div className="w-full max-w-3xl rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-[0_10px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl">
              <div className="flex items-center gap-2 rounded-full bg-black/45 px-3 py-2">
                <input
                  value={promptInput}
                  onChange={(event) => setPromptInput(event.target.value)}
                  placeholder="Ask Clyve to build your next Smart Prompt product..."
                  className="h-10 w-full bg-transparent px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-black transition hover:bg-zinc-200"
                  aria-label="Submit prompt"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
