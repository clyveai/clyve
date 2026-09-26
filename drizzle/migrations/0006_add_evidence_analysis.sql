CREATE TABLE "thesis_evidence_analysis_state" (
	"thesis_id" uuid PRIMARY KEY NOT NULL,
	"last_attempt_at" timestamp with time zone NOT NULL,
	"next_analysis_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evidence_assumptions" ADD COLUMN "source_quote" text;--> statement-breakpoint
ALTER TABLE "evidence_assumptions" ADD COLUMN "ai_provider" text;--> statement-breakpoint
ALTER TABLE "evidence_assumptions" ADD COLUMN "ai_model" text;--> statement-breakpoint
ALTER TABLE "evidence_assumptions" ADD COLUMN "prompt_version" text;--> statement-breakpoint
ALTER TABLE "evidence_assumptions" ADD COLUMN "thesis_version" integer;--> statement-breakpoint
ALTER TABLE "thesis_evidence_analysis_state" ADD CONSTRAINT "thesis_evidence_analysis_state_thesis_id_theses_id_fk" FOREIGN KEY ("thesis_id") REFERENCES "public"."theses"("id") ON DELETE cascade ON UPDATE no action;