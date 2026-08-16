"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AmbientGlow from "@/app/(app)/_components/AmbientGlow";
import AvatarDropdown from "@/app/(app)/_components/AvatarDropdown";
import { MobileTopNav } from "@/app/(app)/_components/sidebar/MobileTopNav";
import { ResearchSidebar } from "@/app/(app)/_components/sidebar/ResearchSidebar";
import { useSidebar } from "@/context/SidebarContext";
import { ThesisStartPanel } from "@/modules/thesis/components/ThesisStartPanel";

type DashboardUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const router = useRouter();

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

  const handleNewThesis = useCallback(() => {
    router.push("/thesis/new");
  }, [router]);

  const sidebarWidth = isCollapsed ? 56 : 260;
  const topOffset = isMobile ? 52 : 80;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)] text-white">
      <AmbientGlow />
      <ResearchSidebar
        user={user}
        onNewThesis={handleNewThesis}
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
          <div className="flex flex-1 items-center justify-center py-10">
            <motion.div
              initial={{ opacity: 0.65, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full"
            >
              <ThesisStartPanel />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
