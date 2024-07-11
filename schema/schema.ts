import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name"),
  password: text("password"),
  agence: varchar("agence", { length: 256 }).unique(),
  role: text("role").default("user"),
  counter: integer("counter").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  status: text("status").default("waiting"),
  comment: text("comment"),
  ticket: integer("ticket"),
  cost: integer("cost"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: text("created_bv").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const userRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  processed: many(orders),
}));

export const orderParcel = pgTable("order_parcel", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  tracking: text("tracking").notNull(),
  packages: text("packages").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const parcelOrderRelations = relations(orders, ({ many }) => ({
  parcels: many(orderParcel),
}));
