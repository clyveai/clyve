import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const newsSyncState = pgTable("news_sync_state", {
  companyCik: varchar("company_cik", { length: 10 }).primaryKey(),
  lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true, mode: "date" }).notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true, mode: "date" }),
  nextSyncAt: timestamp("next_sync_at", { withTimezone: true, mode: "date" }).notNull(),
});
