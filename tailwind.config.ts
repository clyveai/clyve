import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-geist-sans)"],
                mono: ["var(--font-geist-mono)"],
            },
            colors: {
                // Dark Monochrome Palette (TradingView-inspired)
                background: {
                    DEFAULT: "#0f1419",
                    secondary: "#1a1f29",
                    tertiary: "#232a35",
                },
                foreground: {
                    DEFAULT: "#f0f1f3",
                    secondary: "#b0b3ba",
                    tertiary: "#707580",
                },
                accent: {
                    DEFAULT: "#ffffff",
                    muted: "#d1d5db",
                    dark: "#6b7280",
                },
                border: {
                    DEFAULT: "#2a3142",
                    light: "#3a4555",
                },
                // Chart/UI colors with subtle accents
                chart: {
                    positive: "#10b981",
                    negative: "#ef4444",
                    neutral: "#6b7280",
                },
            },
            backgroundColor: {
                glass: "rgba(255, 255, 255, 0.05)",
                "glass-dark": "rgba(0, 0, 0, 0.3)",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [animate],
}

export default config