ALTER TABLE "order_parcel" ALTER COLUMN "packages" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order_parcel" ADD COLUMN "cr" text;--> statement-breakpoint
ALTER TABLE "order_parcel" ADD COLUMN "origin" text;