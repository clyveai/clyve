export type ChangeType = "added" | "improved" | "fixed" | "removed" | "security";

export interface ChangeItem {
    type: ChangeType;
    description: string;
}

export interface ChangelogEntry {
    version: string;
    date: string;
    slug: string;
    label?: "latest" | "beta" | "alpha";
    title: string;
    subtitle: string;
    description: string;
    changes: ChangeItem[]; // Image opsional dihapus total sesuai instruksi
}

export const changelog: ChangelogEntry[] = [
    {
        version: "v0.2.0",
        date: "Jun 9, 2026",
        slug: "auth-system",
        label: "latest",
        title: "Authentication System",
        subtitle: "Users can now create accounts and sign in securely.",
        description:
            "The full authentication layer is live. Register with email and password, sign in with persistent sessions, and access protected routes. Built on Better Auth with server-side session handling — no tokens exposed to the client.",
        changes: [
            { type: "added", description: "User registration with email and password" },
            { type: "added", description: "Secure sign-in flow with persistent session management" },
            { type: "added", description: "Password validation and real-time error handling" },
            { type: "added", description: "Protected route architecture for the upcoming dashboard" },
            { type: "security", description: "Sessions handled server-side via Better Auth — zero client-side token exposure" },
        ],
    },
    {
        version: "v0.1.0",
        date: "Jun 1, 2026",
        slug: "initial-release",
        label: "alpha",
        title: "Initial Release",
        subtitle: "Clyve is live. Core infrastructure and public site.",
        description:
            "The foundation is in place. Public marketing site is live with Use Cases, Pricing, and Changelog. Database schema and backend infrastructure are deployed. NYSE & NASDAQ coverage scope is defined for V1, with SEC EDGAR as the primary data source.",
        changes: [
            { type: "added", description: "Public marketing site — Use Cases, Pricing, Changelog" },
            { type: "added", description: "Core database schema and backend infrastructure on Supabase" },
            { type: "added", description: "NYSE & NASDAQ coverage scope defined for V1" },
            { type: "added", description: "SEC EDGAR as primary data source — no third-party intermediaries" },
        ],
    },
];

// Menggunakan border dan warna teks kontras tinggi (Monokrom)
export const CHANGE_TYPE_CONFIG: Record<ChangeType, { label: string; text: string; bg: string; border: string }> = {
    added: { label: "Added", text: "#ffffff", bg: "#1a1a1a", border: "#27272a" },
    improved: { label: "Improved", text: "#a1a1aa", bg: "#080808", border: "#1a1a1a" },
    fixed: { label: "Fixed", text: "#a1a1aa", bg: "#080808", border: "#1a1a1a" },
    removed: { label: "Removed", text: "#71717a", bg: "#000000", border: "#1a1a1a" },
    security: { label: "Security", text: "#ffffff", bg: "#27272a", border: "#3f3f46" },
};

export const VERSION_LABEL_CONFIG: Record<
    NonNullable<ChangelogEntry["label"]>,
    { text: string; bg: string; border: string }
> = {
    latest: { text: "Latest", bg: "#ffffff", border: "#ffffff" }, // Teks hitam otomatis via utility jika bg putih
    beta: { text: "Beta", bg: "#1a1a1a", border: "#27272a" },
    alpha: { text: "Alpha", bg: "#080808", border: "#1a1a1a" },
};