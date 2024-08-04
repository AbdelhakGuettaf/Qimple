ALTER TABLE "employees" ALTER COLUMN "rh_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "active" boolean DEFAULT true;