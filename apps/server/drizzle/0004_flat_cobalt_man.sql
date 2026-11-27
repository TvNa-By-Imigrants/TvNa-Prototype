ALTER TABLE "day_plan" ADD COLUMN "share_token_hash" text;--> statement-breakpoint
CREATE UNIQUE INDEX "day_plan_share_token_hash_idx" ON "day_plan" USING btree ("share_token_hash");