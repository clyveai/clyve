ALTER TABLE "theses" ADD COLUMN "company_cik" varchar(10);--> statement-breakpoint
CREATE INDEX "theses_company_cik_idx" ON "theses" USING btree ("company_cik");