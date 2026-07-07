"use client";

import { usePathname } from "next/navigation";
import Header from "@/shared/layout/Header";
import Footer from "@/shared/layout/Footer";

const noMarketingChromePrefixes = ["/login", "/signup", "/dashboard", "/settings"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideMarketingChrome = noMarketingChromePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (hideMarketingChrome) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
