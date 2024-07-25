ALTER TABLE "users" RENAME COLUMN "agence" TO "agency_id";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_agence_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "agency_id" SET DATA TYPE integer USING agency_id::integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
