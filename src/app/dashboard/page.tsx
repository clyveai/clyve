"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import AmbientGlow from "@/components/dashboard/AmbientGlow";
import AvatarDropdown from "@/components/dashboard/AvatarDropdown";
import { MobileTopNav } from "@/components/sidebar/MobileTopNav";
import { ResearchSidebar } from "@/components/sidebar/ResearchSidebar";
import { useSidebar } from "@/context/SidebarContext";
import { generateResearchTitle } from "@/lib/generateResearchTitle";

type DashboardUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export default function DashboardPage() {
  const [promptInput, setPromptInput] = useState("");
  const [user, setUser] = useState<DashboardUser | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isMobile, isCollapsed } = useSidebar();

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

  const handleHistoryItemClick = useCallback((query: string) => {
    setPromptInput(query);
    inputRef.current?.focus();
  }, []);

  const handleNewResearch = useCallback(() => {
    setPromptInput("");
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!promptInput.trim()) return;

      const title = generateResearchTitle(promptInput);

      try {
        await fetch("/api/research-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: promptInput, title }),
        });
        setPromptInput("");
      } catch (error) {
        console.error("Failed to save research history:", error);
      }
    },
    [promptInput],
  );

  const sidebarWidth = isCollapsed ? 56 : 260;
  const topOffset = isMobile ? 52 : 80;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)] text-white">
      <AmbientGlow />
      <ResearchSidebar
        user={user}
        onHistoryItemClick={handleHistoryItemClick}
        onNewResearch={handleNewResearch}
      />

      {isMobile && <MobileTopNav user={user} />}

      {!isMobile && (
        <header className="fixed inset-x-0 top-0 z-30" style={{ marginLeft: sidebarWidth }}>
          <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link href="/dashboard" className="text-sm font-semibold uppercase tracking-[0.26em] text-zinc-100">
              Clyve
            </Link>
            <AvatarDropdown name={user?.name || null} email={user?.email || null} />
          </div>
        </header>
      )}

      <main
        className="relative z-10 flex min-h-screen flex-col px-4 pb-8 transition-all duration-200 sm:px-6"
        style={{ marginLeft: isMobile ? 0 : sidebarWidth, paddingTop: topOffset }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center">
            <motion.h1
              initial={{ opacity: 0.65, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative text-4xl font-semibold tracking-[-0.05em] text-zinc-200 sm:text-5xl md:text-6xl lg:text-7xl"
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

          <form onSubmit={handleSubmit} className="mb-4 flex justify-center">
            <div className="w-full max-w-xl rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-[0_10px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:max-w-3xl">
              <div className="flex items-center gap-2 rounded-full bg-black/45 px-3 py-2">
                <input
                  ref={inputRef}
                  value={promptInput}
                  onChange={(event) => setPromptInput(event.target.value)}
                  placeholder="Research a stock, company, or SEC filing..."
                  className="h-10 w-full bg-transparent px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                />
                <button
                  type="submit"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-black transition hover:bg-zinc-200"
                  aria-label="Submit prompt"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
