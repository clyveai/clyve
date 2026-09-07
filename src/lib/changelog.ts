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
    changes: ChangeItem[];
}

export const changelog: ChangelogEntry[] = [
    {
        version: "v0.4.0",
        date: "Sep 1, 2026",
        slug: "thesis-capture-engine",
        label: "latest",
        title: "Thesis Capture & Monitoring Engine",
        subtitle: "Write a thesis, track its assumptions, and pull the SEC filings that test them.",
        description:
            "The core thesis loop is live. Record a thesis in the workspace sidebar, edit or archive it as your view changes, and every revision keeps its assumption history. Tickers are validated and canonicalized against SEC EDGAR so filings map to the right entity, and the filing list surfaces the 10-Q, 10-K, and 8-K evidence your assumptions get checked against.",
        changes: [
            { type: "added", description: "Thesis capture and monitoring schema" },
            { type: "added", description: "Thesis workspace sidebar layout with loading states" },
            { type: "added", description: "Thesis editing, archival, and assumption versioning" },
            { type: "added", description: "SEC ticker validation and canonicalization" },
            { type: "added", description: "SEC filing retrieval" },
            { type: "added", description: "SEC filing list view" },
        ],
    },
    {
        version: "v0.3.0",
        date: "Sep 3, 2026",
        slug: "thesis-dashboard",
        title: "Thesis Dashboard",
        subtitle: "A dashboard for tracking thesis evidence over time, with research history and updated pricing.",
        description:
            "Record why you hold a position, and track the evidence against it over time. This release ships the dashboard layout and research history view, alongside a synced pricing page and a fix to the authentication flow.",
        changes: [
            { type: "added", description: "Dashboard layout and research history view for tracking thesis evidence over time" },
            { type: "improved", description: "Use cases page redesign with UI refinements across the marketing site" },
            { type: "improved", description: "Pricing page and documentation synced with the finalized V1 pricing model" },
            { type: "fixed", description: "Async params type error in the research history API route" },
            { type: "fixed", description: "Authentication flow issue" },
        ],
    },
    {
        version: "v0.2.0",
        date: "Jun 9, 2026",
        slug: "auth-system",
        title: "Authentication System",
        subtitle: "Users can now create accounts and sign in securely.",
        description:
            "The full authentication layer is live. Register with email and password, sign in with persistent sessions, and access protected routes, the foundation every thesis you record will sit behind. Built on Better Auth with server-side session handling, no tokens exposed to the client.",
        changes: [
            { type: "added", description: "User registration with email and password" },
            { type: "added", description: "Secure sign-in flow with persistent session management" },
            { type: "added", description: "Password validation and real-time error handling" },
            { type: "added", description: "Protected route architecture for the upcoming dashboard" },
            { type: "security", description: "Sessions handled server-side via Better Auth, zero client-side token exposure" },
        ],
    },
    {
        version: "v0.1.0",
        date: "Jun 1, 2026",
        slug: "initial-release",
        label: "alpha",
        title: "Initial Release",
        subtitle: "ClyveAI is live. Core infrastructure and public site.",
        description:
            "The foundation is in place. Public marketing site is live with Use Cases, Pricing, and Changelog. Database schema and backend infrastructure are deployed. NYSE & NASDAQ coverage scope is defined for V1, with SEC EDGAR as the primary data source, no third-party intermediaries.",
        changes: [
            { type: "added", description: "Public marketing site, Use Cases, Pricing, Changelog" },
            { type: "added", description: "Core database schema and backend infrastructure on Supabase" },
            { type: "added", description: "NYSE & NASDAQ coverage scope defined for V1" },
            { type: "added", description: "SEC EDGAR as primary data source, no third-party intermediaries" },
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
    latest: { text: "Latest", bg: "#ffffff", border: "#ffffff" },
    beta: { text: "Beta", bg: "#1a1a1a", border: "#27272a" },
    alpha: { text: "Alpha", bg: "#080808", border: "#1a1a1a" },
};