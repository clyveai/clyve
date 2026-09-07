"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { Loader2, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/infrastructure/auth/auth-client";

type AvatarDropdownProps = {
  name: string | null;
  email: string | null;
};

export default function AvatarDropdown({ name, email }: AvatarDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const initials = (email?.slice(0, 2) ?? "CL").toUpperCase();

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setIsSigningOut(false);
      setOpen(false);
    }
  };

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-zinc-100 backdrop-blur-md transition hover:border-white/30"
        >
          {initials}
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          sideOffset={12}
          align="end"
          className="z-50 w-[280px] rounded-2xl border border-white/10 bg-black/65 p-0 shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl outline-none"
        >
          <AnimatePresence>
            {open ? (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="p-4"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Profile</p>
                <p className="mt-2 truncate text-sm font-medium text-zinc-100">{name || "Clyve Member"}</p>
                <p className="truncate text-xs text-zinc-400">{email || "-"}</p>

                <div className="mt-4 grid gap-2">
                  <DropdownMenuPrimitive.Item asChild>
                    <Link
                      href="/dashboard/settings"
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-zinc-100 outline-none transition hover:bg-white/10"
                    >
                      <Settings className="h-4 w-4 text-violet-500" />
                      Settings
                    </Link>
                  </DropdownMenuPrimitive.Item>

                  <DropdownMenuPrimitive.Item asChild>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isSigningOut}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-left text-sm text-zinc-100 outline-none transition hover:bg-white/10 disabled:opacity-60"
                    >
                      {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 text-zinc-300" />}
                      Logout
                    </button>
                  </DropdownMenuPrimitive.Item>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
