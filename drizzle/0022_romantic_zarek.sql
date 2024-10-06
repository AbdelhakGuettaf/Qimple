ALTER TABLE "orders" ADD COLUMN "dateString" date;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "uniqueTicketPerDay" UNIQUE("ticket","agency_id","dateString");