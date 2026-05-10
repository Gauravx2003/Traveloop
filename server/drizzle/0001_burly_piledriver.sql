CREATE TABLE "global_cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"cost_index" integer,
	"popularity" integer,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "trip_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer,
	"stop_id" integer,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "activities" DROP CONSTRAINT "activities_stop_id_stops_id_fk";
--> statement-breakpoint
ALTER TABLE "packing_items" DROP CONSTRAINT "packing_items_trip_id_trips_id_fk";
--> statement-breakpoint
ALTER TABLE "stops" DROP CONSTRAINT "stops_trip_id_trips_id_fk";
--> statement-breakpoint
ALTER TABLE "trips" DROP CONSTRAINT "trips_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "cost" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "cost" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "packing_items" ALTER COLUMN "category" SET DEFAULT 'General';--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "start_time" timestamp;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "duration" text;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "cover_photo" text;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "share_slug" text;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "status" text DEFAULT 'planning';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_photo" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "language" text DEFAULT 'en';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "trip_notes" ADD CONSTRAINT "trip_notes_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_notes" ADD CONSTRAINT "trip_notes_stop_id_stops_id_fk" FOREIGN KEY ("stop_id") REFERENCES "public"."stops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_stop_id_stops_id_fk" FOREIGN KEY ("stop_id") REFERENCES "public"."stops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_items" ADD CONSTRAINT "packing_items_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stops" ADD CONSTRAINT "stops_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_share_slug_unique" UNIQUE("share_slug");