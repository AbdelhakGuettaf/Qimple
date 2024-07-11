import { boolean, pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";

export const Parcel = pgTable("Parcel", {
  id: serial("id").primaryKey(),
  text: text("text"),
  createdAt: timestamp("createdAt", { withTimezone: false }),
  scannedAt: timestamp("scannedAt", { withTimezone: false }),
  updatedAt: timestamp("updatedAt", { withTimezone: false }),
  zoneId: text("zoneId"),
  tracking: text("tracking"),
  code: text("code"),
  delivered: boolean("delivered"),
  current: boolean("current"),
  returnRequested: boolean("return_requested"),
});

export const Zone = pgTable("Zone", {
  id: serial("id").primaryKey(),
  zoneName: text("zoneName"),
  agencyId: text("agencyId"),
});
