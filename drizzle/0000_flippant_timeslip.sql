CREATE TABLE IF NOT EXISTS "order_parcel" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"code" text NOT NULL,
	"packages" text NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"tracking" varchar(256) NOT NULL,
	"status" text DEFAULT 'waiting',
	"comment" text,
	"user_id" integer,
	"cost" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_name_unique" UNIQUE("name"),
	CONSTRAINT "orders_tracking_unique" UNIQUE("tracking")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text,
	"password" text,
	"agence" varchar(256),
	"role" text DEFAULT 'user',
	"counter" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_agence_unique" UNIQUE("agence")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_parcel" ADD CONSTRAINT "order_parcel_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
