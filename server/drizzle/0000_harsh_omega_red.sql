CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"stop_id" integer,
	"title" text NOT NULL,
	"cost" numeric DEFAULT '0',
	"category" text
);
--> statement-breakpoint
CREATE TABLE "packing_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer,
	"item" text NOT NULL,
	"is_packed" boolean DEFAULT false,
	"category" text
);
--> statement-breakpoint
CREATE TABLE "stops" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer,
	"city_name" text NOT NULL,
	"arrival_date" timestamp,
	"departure_date" timestamp,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"description" text,
	"is_public" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_stop_id_stops_id_fk" FOREIGN KEY ("stop_id") REFERENCES "public"."stops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_items" ADD CONSTRAINT "packing_items_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stops" ADD CONSTRAINT "stops_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;