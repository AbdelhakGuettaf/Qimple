CREATE TABLE IF NOT EXISTS "agencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"network" varchar(256),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agencies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "agency_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
