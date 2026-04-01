import "@/styles/globals.css"
import type { Metadata, Viewport } from "next"
import { ThemeProvider } from "next-themes"
import { Geist, Geist_Mono } from "next/font/google"
import { cn } from "@/lib/utils"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://clyve.ai"),
  title: {
    default: "Clyve AI",
    template: "%s | Clyve AI",
  },
  description:
    "Clyve AI — Professional-grade AI agent platform for stock and crypto market intelligence.",
  keywords: [
    "Clyve AI",
    "AI Agent",
    "Market Intelligence",
    "Crypto Analysis",
    "Stock Market AI",
    "Financial Automation",
    "Trading AI",
  ],
  authors: [{ name: "Clyve AI Team", url: "https://clyve.ai" }],
  creator: "Clyve AI",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Clyve AI | Professional Market Intelligence",
    description: "AI-powered market analysis for stocks and crypto",
    url: "https://clyve.ai",
    siteName: "Clyve AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clyve AI",
    description: "Professional-grade AI agent platform for market intelligence",
    creator: "@clyveai",
  },
}

export const viewport: Viewport = {
  themeColor: "#0f1419",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "min-h-screen bg-background-DEFAULT text-foreground-DEFAULT antialiased"
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}