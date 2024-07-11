ALTER TABLE "order_parcel" RENAME COLUMN "code" TO "tracking";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_name_unique";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_tracking_unique";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "created_bv" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN IF EXISTS "tracking";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN IF EXISTS "user_id";