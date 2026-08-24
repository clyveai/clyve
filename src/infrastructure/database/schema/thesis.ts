import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const thesisPosition = pgEnum("thesis_position", ["long", "short", "watching"]);
export const thesisStatus = pgEnum("thesis_status", ["active", "paused", "archived"]);
export const thesisHealth = pgEnum("thesis_health", ["unknown", "aligned", "watch", "diverged"]);
export const assumptionStatus = pgEnum("assumption_status", ["active", "retired"]);
export const assumptionImportance = pgEnum("assumption_importance", ["critical", "high", "medium", "low"]);
export const sourceType = pgEnum("source_type", [
  "sec_filing",
  "earnings_release",
  "company_announcement",
  "news",
  "other",
]);
export const companyEventType = pgEnum("company_event_type", [
  "filing",
  "earnings",
  "guidance",
  "announcement",
  "news",
  "other",
]);
export const evidenceType = pgEnum("evidence_type", ["fact", "guidance", "risk", "event", "other"]);
export const evidenceRelationship = pgEnum("evidence_relationship", [
  "supporting",
  "contradicting",
  "contextual",
  "unclear",
]);
export const materiality = pgEnum("materiality", ["low", "medium", "high"]);
export const alertKind = pgEnum("alert_kind", ["divergence", "supporting_change"]);
export const alertStatus = pgEnum("alert_status", ["open", "acknowledged", "dismissed", "resolved"]);

export const theses = pgTable(
  "theses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ticker: varchar("ticker", { length: 16 }).notNull(),
    companyName: text("company_name"),
    companyCik: varchar("company_cik", { length: 10 }),
    position: thesisPosition("position").notNull().default("watching"),
    title: text("title").notNull(),
    thesis: text("thesis").notNull(),
    timeHorizon: text("time_horizon"),
    status: thesisStatus("status").notNull().default("active"),
    health: thesisHealth("health").notNull().default("unknown"),
    version: integer("version").notNull().default(1),
    lastEvaluatedAt: timestamp("last_evaluated_at", { withTimezone: true, mode: "date" }),
    archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    userStatusUpdatedIdx: index("theses_user_status_updated_idx").on(table.userId, table.status, table.updatedAt),
    userTickerIdx: index("theses_user_ticker_idx").on(table.userId, table.ticker),
    companyCikIdx: index("theses_company_cik_idx").on(table.companyCik),
  }),
);

export const thesisAssumptions = pgTable(
  "thesis_assumptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    thesisId: uuid("thesis_id")
      .notNull()
      .references(() => theses.id, { onDelete: "cascade" }),
    statement: text("statement").notNull(),
    expectedOutcome: text("expected_outcome"),
    metric: text("metric"),
    importance: assumptionImportance("importance").notNull().default("medium"),
    status: assumptionStatus("status").notNull().default("active"),
    sortOrder: integer("sort_order").notNull().default(0),
    retiredAt: timestamp("retired_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    thesisStatusSortIdx: index("thesis_assumptions_thesis_status_sort_idx").on(
      table.thesisId,
      table.status,
      table.sortOrder,
    ),
  }),
);

/** A canonical public document. Sources are retained for alert traceability. */
export const sources = pgTable(
  "sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceKey: text("source_key").notNull(),
    provider: text("provider").notNull(),
    type: sourceType("type").notNull(),
    title: text("title").notNull(),
    publisher: text("publisher"),
    url: text("url").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
    retrievedAt: timestamp("retrieved_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    content: text("content"),
    contentHash: text("content_hash"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    sourceKeyUnique: uniqueIndex("sources_source_key_unique").on(table.sourceKey),
  }),
);

/** A company-level event inferred from one public source in the initial MVP. */
export const companyEvents = pgTable(
  "company_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ticker: varchar("ticker", { length: 16 }).notNull(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id),
    type: companyEventType("type").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    occurredAt: timestamp("occurred_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    tickerOccurredIdx: index("company_events_ticker_occurred_idx").on(table.ticker, table.occurredAt),
    sourceIdx: index("company_events_source_idx").on(table.sourceId),
  }),
);

/** An attributable factual claim or excerpt extracted from a public source. */
export const evidence = pgTable(
  "evidence",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id),
    eventId: uuid("event_id").references(() => companyEvents.id, { onDelete: "set null" }),
    ticker: varchar("ticker", { length: 16 }).notNull(),
    type: evidenceType("type").notNull(),
    claim: text("claim").notNull(),
    excerpt: text("excerpt"),
    sourceLocator: text("source_locator"),
    occurredAt: timestamp("occurred_at", { withTimezone: true, mode: "date" }),
    fingerprint: text("fingerprint"),
    structuredData: jsonb("structured_data").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    sourceIdx: index("evidence_source_idx").on(table.sourceId),
    tickerOccurredIdx: index("evidence_ticker_occurred_idx").on(table.ticker, table.occurredAt),
    fingerprintUnique: uniqueIndex("evidence_fingerprint_unique").on(table.fingerprint),
  }),
);

/** The explainable assessment of a piece of evidence against an assumption. */
export const evidenceAssumptions = pgTable(
  "evidence_assumptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    evidenceId: uuid("evidence_id")
      .notNull()
      .references(() => evidence.id, { onDelete: "cascade" }),
    thesisAssumptionId: uuid("thesis_assumption_id")
      .notNull()
      .references(() => thesisAssumptions.id, { onDelete: "cascade" }),
    relationship: evidenceRelationship("relationship").notNull(),
    materiality: materiality("materiality").notNull().default("low"),
    rationale: text("rationale").notNull(),
    confidence: integer("confidence"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    evidenceAssumptionUnique: uniqueIndex("evidence_assumptions_evidence_assumption_unique").on(
      table.evidenceId,
      table.thesisAssumptionId,
    ),
    assumptionCreatedIdx: index("evidence_assumptions_assumption_created_idx").on(
      table.thesisAssumptionId,
      table.createdAt,
    ),
  }),
);

export const thesisAlerts = pgTable(
  "thesis_alerts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    thesisId: uuid("thesis_id")
      .notNull()
      .references(() => theses.id, { onDelete: "cascade" }),
    thesisAssumptionId: uuid("thesis_assumption_id")
      .notNull()
      .references(() => thesisAssumptions.id, { onDelete: "cascade" }),
    kind: alertKind("kind").notNull(),
    severity: materiality("severity").notNull(),
    status: alertStatus("status").notNull().default("open"),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    whyItMatters: text("why_it_matters").notNull(),
    potentialImpact: text("potential_impact"),
    triggeredAt: timestamp("triggered_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true, mode: "date" }),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    thesisStatusTriggeredIdx: index("thesis_alerts_thesis_status_triggered_idx").on(
      table.thesisId,
      table.status,
      table.triggeredAt,
    ),
    assumptionTriggeredIdx: index("thesis_alerts_assumption_triggered_idx").on(
      table.thesisAssumptionId,
      table.triggeredAt,
    ),
  }),
);

/** An alert can cite one or more evidence-to-assumption assessments. */
export const alertEvidence = pgTable(
  "alert_evidence",
  {
    alertId: uuid("alert_id")
      .notNull()
      .references(() => thesisAlerts.id, { onDelete: "cascade" }),
    evidenceAssumptionId: uuid("evidence_assumption_id")
      .notNull()
      .references(() => evidenceAssumptions.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.alertId, table.evidenceAssumptionId] }),
    alertSortIdx: index("alert_evidence_alert_sort_idx").on(table.alertId, table.sortOrder),
  }),
);
