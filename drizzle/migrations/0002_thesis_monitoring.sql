CREATE TYPE "public"."alert_kind" AS ENUM('divergence', 'supporting_change');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('open', 'acknowledged', 'dismissed', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."assumption_importance" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."assumption_status" AS ENUM('active', 'retired');--> statement-breakpoint
CREATE TYPE "public"."company_event_type" AS ENUM('filing', 'earnings', 'guidance', 'announcement', 'news', 'other');--> statement-breakpoint
CREATE TYPE "public"."evidence_relationship" AS ENUM('supporting', 'contradicting', 'contextual', 'unclear');--> statement-breakpoint
CREATE TYPE "public"."evidence_type" AS ENUM('fact', 'guidance', 'risk', 'event', 'other');--> statement-breakpoint
CREATE TYPE "public"."materiality" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('sec_filing', 'earnings_release', 'company_announcement', 'news', 'other');--> statement-breakpoint
CREATE TYPE "public"."thesis_health" AS ENUM('unknown', 'aligned', 'watch', 'diverged');--> statement-breakpoint
CREATE TYPE "public"."thesis_position" AS ENUM('long', 'short', 'watching');--> statement-breakpoint
CREATE TYPE "public"."thesis_status" AS ENUM('active', 'paused', 'archived');--> statement-breakpoint
CREATE TABLE "alert_evidence" (
	"alert_id" uuid NOT NULL,
	"evidence_assumption_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "alert_evidence_alert_id_evidence_assumption_id_pk" PRIMARY KEY("alert_id","evidence_assumption_id")
);
--> statement-breakpoint
CREATE TABLE "company_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticker" varchar(16) NOT NULL,
	"source_id" uuid NOT NULL,
	"type" "company_event_type" NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"occurred_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"event_id" uuid,
	"ticker" varchar(16) NOT NULL,
	"type" "evidence_type" NOT NULL,
	"claim" text NOT NULL,
	"excerpt" text,
	"source_locator" text,
	"occurred_at" timestamp with time zone,
	"fingerprint" text,
	"structured_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_assumptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evidence_id" uuid NOT NULL,
	"thesis_assumption_id" uuid NOT NULL,
	"relationship" "evidence_relationship" NOT NULL,
	"materiality" "materiality" DEFAULT 'low' NOT NULL,
	"rationale" text NOT NULL,
	"confidence" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_key" text NOT NULL,
	"provider" text NOT NULL,
	"type" "source_type" NOT NULL,
	"title" text NOT NULL,
	"publisher" text,
	"url" text NOT NULL,
	"published_at" timestamp with time zone,
	"retrieved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"content" text,
	"content_hash" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"ticker" varchar(16) NOT NULL,
	"company_name" text,
	"position" "thesis_position" DEFAULT 'watching' NOT NULL,
	"title" text NOT NULL,
	"thesis" text NOT NULL,
	"time_horizon" text,
	"status" "thesis_status" DEFAULT 'active' NOT NULL,
	"health" "thesis_health" DEFAULT 'unknown' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"last_evaluated_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thesis_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thesis_id" uuid NOT NULL,
	"thesis_assumption_id" uuid NOT NULL,
	"kind" "alert_kind" NOT NULL,
	"severity" "materiality" NOT NULL,
	"status" "alert_status" DEFAULT 'open' NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"why_it_matters" text NOT NULL,
	"potential_impact" text,
	"triggered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"acknowledged_at" timestamp with time zone,
	"dismissed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thesis_assumptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thesis_id" uuid NOT NULL,
	"statement" text NOT NULL,
	"expected_outcome" text,
	"metric" text,
	"importance" "assumption_importance" DEFAULT 'medium' NOT NULL,
	"status" "assumption_status" DEFAULT 'active' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"retired_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alert_evidence" ADD CONSTRAINT "alert_evidence_alert_id_thesis_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."thesis_alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_evidence" ADD CONSTRAINT "alert_evidence_evidence_assumption_id_evidence_assumptions_id_fk" FOREIGN KEY ("evidence_assumption_id") REFERENCES "public"."evidence_assumptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_events" ADD CONSTRAINT "company_events_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_event_id_company_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."company_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_assumptions" ADD CONSTRAINT "evidence_assumptions_evidence_id_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_assumptions" ADD CONSTRAINT "evidence_assumptions_thesis_assumption_id_thesis_assumptions_id_fk" FOREIGN KEY ("thesis_assumption_id") REFERENCES "public"."thesis_assumptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theses" ADD CONSTRAINT "theses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thesis_alerts" ADD CONSTRAINT "thesis_alerts_thesis_id_theses_id_fk" FOREIGN KEY ("thesis_id") REFERENCES "public"."theses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thesis_alerts" ADD CONSTRAINT "thesis_alerts_thesis_assumption_id_thesis_assumptions_id_fk" FOREIGN KEY ("thesis_assumption_id") REFERENCES "public"."thesis_assumptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thesis_assumptions" ADD CONSTRAINT "thesis_assumptions_thesis_id_theses_id_fk" FOREIGN KEY ("thesis_id") REFERENCES "public"."theses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alert_evidence_alert_sort_idx" ON "alert_evidence" USING btree ("alert_id","sort_order");--> statement-breakpoint
CREATE INDEX "company_events_ticker_occurred_idx" ON "company_events" USING btree ("ticker","occurred_at");--> statement-breakpoint
CREATE INDEX "company_events_source_idx" ON "company_events" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "evidence_source_idx" ON "evidence" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "evidence_ticker_occurred_idx" ON "evidence" USING btree ("ticker","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "evidence_fingerprint_unique" ON "evidence" USING btree ("fingerprint");--> statement-breakpoint
CREATE UNIQUE INDEX "evidence_assumptions_evidence_assumption_unique" ON "evidence_assumptions" USING btree ("evidence_id","thesis_assumption_id");--> statement-breakpoint
CREATE INDEX "evidence_assumptions_assumption_created_idx" ON "evidence_assumptions" USING btree ("thesis_assumption_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sources_source_key_unique" ON "sources" USING btree ("source_key");--> statement-breakpoint
CREATE INDEX "theses_user_status_updated_idx" ON "theses" USING btree ("user_id","status","updated_at");--> statement-breakpoint
CREATE INDEX "theses_user_ticker_idx" ON "theses" USING btree ("user_id","ticker");--> statement-breakpoint
CREATE INDEX "thesis_alerts_thesis_status_triggered_idx" ON "thesis_alerts" USING btree ("thesis_id","status","triggered_at");--> statement-breakpoint
CREATE INDEX "thesis_alerts_assumption_triggered_idx" ON "thesis_alerts" USING btree ("thesis_assumption_id","triggered_at");--> statement-breakpoint
CREATE INDEX "thesis_assumptions_thesis_status_sort_idx" ON "thesis_assumptions" USING btree ("thesis_id","status","sort_order");