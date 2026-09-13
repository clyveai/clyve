CREATE TABLE "news_sync_state" (
	"company_cik" varchar(10) PRIMARY KEY NOT NULL,
	"last_attempt_at" timestamp with time zone NOT NULL,
	"last_synced_at" timestamp with time zone,
	"next_sync_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "company_events" ADD COLUMN "company_cik" varchar(10);--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "provider_article_id" text;--> statement-breakpoint
CREATE INDEX "company_events_company_type_occurred_idx" ON "company_events" USING btree ("company_cik","type","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sources_provider_article_unique" ON "sources" USING btree ("provider","provider_article_id");