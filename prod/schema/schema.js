"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parcelOrderRelations = exports.employees = exports.orderParcel = exports.userRelations = exports.agencyRelations = exports.orders = exports.agencies = exports.users = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    fullName: (0, pg_core_1.text)("full_name"),
    password: (0, pg_core_1.text)("password"),
    agencyId: (0, pg_core_1.integer)("agency_id").references(() => exports.agencies.id),
    role: (0, pg_core_1.text)("role").default("user"),
    counter: (0, pg_core_1.integer)("counter").default(0),
    uuid: (0, pg_core_1.text)("uuid"),
    uui_exp: (0, pg_core_1.timestamp)("uui_exp"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
});
exports.agencies = (0, pg_core_1.pgTable)("agencies", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 256 }).unique(),
    network: (0, pg_core_1.varchar)("network", { length: 256 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (table) => ({
    nameIdx: (0, pg_core_1.index)("name_idx").on(table.name),
    networkIdx: (0, pg_core_1.index)("network_idx").on(table.network),
}));
exports.orders = (0, pg_core_1.pgTable)("orders", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    status: (0, pg_core_1.text)("status").default("Attente"),
    comment: (0, pg_core_1.text)("comment"),
    ticket: (0, pg_core_1.integer)("ticket"),
    cost: (0, pg_core_1.integer)("cost"),
    agencyId: (0, pg_core_1.integer)("agency_id").references(() => exports.agencies.id),
    clientName: (0, pg_core_1.text)("client_name"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    createdBy: (0, pg_core_1.text)("created_bv").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (table) => ({
    ticketIdx: (0, pg_core_1.index)("ticket_idx").on(table.ticket),
    createdAtIdx: (0, pg_core_1.index)("created_at_idx").on(table.createdAt),
    agencyIdIdx: (0, pg_core_1.index)("agency_id_idx").on(table.agencyId),
    orderStatusIdx: (0, pg_core_1.index)("order_status_idx").on(table.status),
}));
exports.agencyRelations = (0, drizzle_orm_1.relations)(exports.agencies, ({ many }) => ({
    orders: many(exports.orders),
    users: many(exports.users),
}));
exports.userRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    orders: many(exports.orders),
}));
exports.orderParcel = (0, pg_core_1.pgTable)("order_parcel", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    orderId: (0, pg_core_1.integer)("order_id").references(() => exports.orders.id),
    tracking: (0, pg_core_1.text)("tracking").notNull(),
    status: (0, pg_core_1.text)("status").default("Attente"),
    packages: (0, pg_core_1.text)("packages"),
    comment: (0, pg_core_1.text)("comment"),
    client: (0, pg_core_1.text)("client"),
    pos: (0, pg_core_1.text)("pos"),
    zone: (0, pg_core_1.text)("zone"),
    cr: (0, pg_core_1.text)("cr"),
    origin: (0, pg_core_1.text)("origin"),
    price: (0, pg_core_1.integer)("price"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (table) => ({
    orderIdIdx: (0, pg_core_1.index)("order_id_idx").on(table.orderId),
    trackingIdx: (0, pg_core_1.index)("tracking_idx").on(table.tracking),
    statusIdx: (0, pg_core_1.index)("status_idx").on(table.status),
}));
exports.employees = (0, pg_core_1.pgTable)("employees", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    rhId: (0, pg_core_1.text)("rh_id").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    active: (0, pg_core_1.boolean)("active").default(true),
    agencyId: (0, pg_core_1.integer)("agency_id").references(() => exports.agencies.id),
}, (table) => ({
    rhIdx: (0, pg_core_1.index)("rh_id_idx").on(table.rhId),
    agencyIdIdx: (0, pg_core_1.index)("agency_id_idx").on(table.agencyId),
    nameIdx: (0, pg_core_1.index)("name_idx").on(table.name),
    activeIdx: (0, pg_core_1.index)("active").on(table.active),
}));
exports.parcelOrderRelations = (0, drizzle_orm_1.relations)(exports.orders, ({ many }) => ({
    parcels: many(exports.orderParcel),
}));
//# sourceMappingURL=schema.js.map