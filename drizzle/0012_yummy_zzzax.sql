CREATE INDEX IF NOT EXISTS "name_idx" ON "agencies" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "network_idx" ON "agencies" USING btree ("network");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_id_idx" ON "order_parcel" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tracking_idx" ON "order_parcel" USING btree ("tracking");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ticket_idx" ON "orders" USING btree ("ticket");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agency_id_idx" ON "orders" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "status_idx" ON "orders" USING btree ("status");