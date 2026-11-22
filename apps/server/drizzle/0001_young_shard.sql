CREATE TABLE "place" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_km" text,
	"area" text NOT NULL,
	"province" text DEFAULT 'Phnom Penh' NOT NULL,
	"category" text NOT NULL,
	"category_id" text NOT NULL,
	"image" text NOT NULL,
	"rating" real,
	"reviews_count" integer,
	"price_level" text,
	"hours" text,
	"is_24_hours" boolean DEFAULT false NOT NULL,
	"is_partnered" boolean DEFAULT false NOT NULL,
	"address" text,
	"description" text,
	"lat" real,
	"lng" real,
	"tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "place_name_idx" ON "place" USING btree ("name");--> statement-breakpoint
CREATE INDEX "place_category_id_idx" ON "place" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "place_price_level_idx" ON "place" USING btree ("price_level");--> statement-breakpoint
CREATE INDEX "place_is_partnered_idx" ON "place" USING btree ("is_partnered");