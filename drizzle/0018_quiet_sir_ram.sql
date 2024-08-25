ALTER TABLE "order_parcel" ADD COLUMN "zone_name" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rh_id_idx" ON "employees" USING btree ("rh_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "employee_agency_id_idx" ON "employees" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "employee_name_idx" ON "employees" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active" ON "employees" USING btree ("active");