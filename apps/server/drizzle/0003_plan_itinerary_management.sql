CREATE TABLE "day_plan" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itinerary_item" (
	"id" text PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"place_id" text NOT NULL,
	"position" integer NOT NULL,
	"start_time" text,
	"end_time" text,
	"notes" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	CONSTRAINT "itinerary_item_start_time_format_check" CHECK ("itinerary_item"."start_time" is null or "itinerary_item"."start_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
	CONSTRAINT "itinerary_item_end_time_format_check" CHECK ("itinerary_item"."end_time" is null or "itinerary_item"."end_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
	CONSTRAINT "itinerary_item_time_range_check" CHECK ("itinerary_item"."start_time" is null or "itinerary_item"."end_time" is null or "itinerary_item"."end_time" > "itinerary_item"."start_time")
);
--> statement-breakpoint
ALTER TABLE "day_plan" ADD CONSTRAINT "day_plan_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_item" ADD CONSTRAINT "itinerary_item_plan_id_day_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."day_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_item" ADD CONSTRAINT "itinerary_item_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "day_plan_user_id_idx" ON "day_plan" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "itinerary_item_plan_position_idx" ON "itinerary_item" USING btree ("plan_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "itinerary_item_plan_place_idx" ON "itinerary_item" USING btree ("plan_id","place_id");