import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../schema";

export const researchHistory = pgTable(
  "research_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    query: text("query").notNull(),
    result: text("result"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("research_history_user_id_idx").on(table.userId),
    createdAtIdx: index("research_history_created_at_idx").on(table.createdAt),
  }),
);
