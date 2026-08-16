import { headers } from "next/headers";
import { auth } from "@/infrastructure/auth/better-auth";

/**
 * The only session facade needed by product modules and app composition.
 * Authentication vendor details stay in infrastructure.
 */
export async function getCurrentUser() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  return session?.user ?? null;
}
