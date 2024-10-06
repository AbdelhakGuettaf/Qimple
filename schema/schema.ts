import { relations, sql } from "drizzle-orm"
import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  index,
  boolean,
  unique,
  date,
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
    nameIdx: index("name_idx").on(table.name),
    networkIdx: index("network_idx").on(table.network),
  })
)

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    status: text("status").default("Attente"),
    cancelled: boolean("cancelled").default(false),
    comment: text("comment"),
    ticket: integer("ticket"),
    cost: integer("cost"),
    agencyId: integer("agency_id").references(() => agencies.id),
    employeeId: integer("employee_id").references(() => employees.id),
    timeToFind: integer("time_to_find"),
    clientName: text("client_name"),
    createdAt: timestamp("created_at").defaultNow(),
    dateString: date("dateString", { mode: "string" }),
    createdBy: text("created_bv").notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    ticketIdx: index("ticket_idx").on(table.ticket),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
    agencyIdIdx: index("agency_id_idx").on(table.agencyId),
    orderStatusIdx: index("order_status_idx").on(table.status),
    uniqueTicketPerDayPerAgency: unique("uniqueTicketPerDay").on(
      table.ticket,
      table.agencyId,
      table.dateString
    ),
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
    status: text("status").default("Attente"),
    zoneName: text("zone_name"),
    packages: text("packages"),
    comment: text("comment"),
    client: text("client"),
    type: text("type"),
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
    orderIdIdx: index("order_id_idx").on(table.orderId),
    trackingIdx: index("tracking_idx").on(table.tracking),
    statusIdx: index("status_idx").on(table.status),
  })
)

export const employees = pgTable(
  "employees",
  {
    id: serial("id").primaryKey(),
    rhId: text("rh_id").notNull(),
    name: text("name").notNull(),
    active: boolean("active").default(true),
    agencyId: integer("agency_id").references(() => agencies.id),
  },
  (table) => ({
    rhIdx: index("rh_id_idx").on(table.rhId),
    agencyIdIdx: index("employee_agency_id_idx").on(table.agencyId),
    nameIdx: index("employee_name_idx").on(table.name),
    activeIdx: index("active").on(table.active),
  })
)

export const employeeRealations = relations(employees, ({ one, many }) => ({
  agency: one(agencies),
  orders: many(orders),
}))

export const parcelOrderRelations = relations(orders, ({ many }) => ({
  parcels: many(orderParcel),
}))
