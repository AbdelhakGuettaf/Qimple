DROP INDEX IF EXISTS "status_idx";--> statement-breakpoint
ALTER TABLE "order_parcel" ADD COLUMN "status" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "status_idx" ON "order_parcel" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_status_idx" ON "orders" USING btree ("status");