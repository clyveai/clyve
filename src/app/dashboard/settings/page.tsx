"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import AmbientGlow from "@/components/dashboard/AmbientGlow";
import AvatarDropdown from "@/components/dashboard/AvatarDropdown";

type AccountUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

export default function DashboardSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadAccount = async () => {
      try {
        const response = await fetch("/api/account", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to load account.");
        }

        const payload = (await response.json()) as { user: AccountUser };
        if (!ignore) {
          setUser(payload.user);
        }
      } catch {
        if (!ignore) {
          setErrorMessage("Unable to load account details.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadAccount();

    return () => {
      ignore = true;
    };
  }, []);

  const handleDeleteAccount = async () => {
    setErrorMessage(null);
    setIsDeleting(true);
    try {
      const typedClient = authClient as unknown as {
        deleteUser?: () => Promise<{ error?: { message?: string } }>;
      };

      if (typedClient.deleteUser) {
        const result = await typedClient.deleteUser();
        if (result?.error) {
          throw new Error(result.error.message ?? "Failed to delete account.");
        }
      } else {
        const response = await fetch("/api/account", {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete account.");
        }
      }

      await authClient.signOut();
      router.push("/");
      router.refresh();
    } catch {
      setErrorMessage("Account deletion failed. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const displayName = user?.name ?? "Not set";
  const initials = (user?.email?.slice(0, 2) || "CL").toUpperCase();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <AmbientGlow />

      <header className="fixed inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="text-sm font-semibold uppercase tracking-[0.26em] text-zinc-100">
            Clyve
          </Link>
          <AvatarDropdown name={user?.name ?? null} email={user?.email ?? null} />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-10 pt-28 sm:px-6">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-7">
          <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Settings</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Account</h1>

          <div className="mt-7 rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300">Profile</h2>
            {isLoading ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading account...
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold">
                  {initials}
                </div>
                <div>
                  <p className="text-sm text-zinc-300">Name: {displayName}</p>
                  <p className="text-sm text-zinc-400">{user?.email ?? "-"}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-950/10 p-4 sm:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-red-300">Danger Zone</h2>
            <p className="mt-2 text-sm text-zinc-400">Delete your account and all associated access permanently.</p>
            {errorMessage ? <p className="mt-3 text-sm text-red-300">{errorMessage}</p> : null}
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl border border-red-400/35 bg-red-500/10 px-4 text-sm font-medium text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showDeleteDialog ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/65 px-4 backdrop-blur-sm"
            onClick={() => setShowDeleteDialog(false)}
          >
            <motion.div
              initial={{ y: 10, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 8, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151413] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="text-[11px] uppercase tracking-[0.24em] text-red-300">Confirm Deletion</p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">Delete account permanently?</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                This action permanently removes your account data and cannot be undone.
              </p>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(false)}
                  className="h-10 rounded-lg border border-white/15 px-4 text-sm text-zinc-200 transition hover:bg-white/[0.07]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
