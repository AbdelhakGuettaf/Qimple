import { relations } from "drizzle-orm"
import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name"),
  password: text("password"),
  agencyId: integer("agency_id").references(() => agencies.id),
  role: text("role").default("user"),
  counter: integer("counter").default(0),
  uuid: text("uuid"),
  uui_exp: timestamp("uui_exp"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const agencies = pgTable(
  "agencies",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).unique(),
    network: varchar("network", { length: 256 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    nameidx: index("name_idx").on(table.name),
    networkidx: index("network_idx").on(table.network),
  })
)

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    status: text("status").default("Attente"),
    comment: text("comment"),
    ticket: integer("ticket"),
    cost: integer("cost"),
    agencyId: integer("agency_id").references(() => agencies.id),
    clientName: text("client_name"),
    createdAt: timestamp("created_at").defaultNow(),
    createdBy: text("created_bv").notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    ticketidx: index("ticket_idx").on(table.ticket),
    createdatidx: index("created_at_idx").on(table.createdAt),
    agencyididx: index("agency_id_idx").on(table.agencyId),
    statusidx: index("status_idx").on(table.status),
  })
)

export const agencyRelations = relations(agencies, ({ many }) => ({
  orders: many(orders),
  users: many(users),
}))

export const userRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}))

export const orderParcel = pgTable(
  "order_parcel",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").references(() => orders.id),
    tracking: text("tracking").notNull(),
    packages: text("packages"),
    comment: text("comment"),
    client: text("client"),
    pos: text("pos"),
    zone: text("zone"),
    cr: text("cr"),
    origin: text("origin"),
    price: integer("price"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    orderididx: index("order_id_idx").on(table.orderId),
    tracking: index("tracking_idx").on(table.tracking),
  })
)

export const parcelOrderRelations = relations(orders, ({ many }) => ({
  parcels: many(orderParcel),
}))
