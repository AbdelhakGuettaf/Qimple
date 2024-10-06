ALTER TABLE "orders" ADD COLUMN "cancelled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "time_to_find" integer;