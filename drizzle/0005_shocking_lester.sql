ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'Attente';--> statement-breakpoint
ALTER TABLE "order_parcel" ADD COLUMN "client" text;