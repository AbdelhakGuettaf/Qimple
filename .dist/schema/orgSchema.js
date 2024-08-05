"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Zone = exports.Parcel = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.Parcel = (0, pg_core_1.pgTable)("Parcel", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    text: (0, pg_core_1.text)("text"),
    createdAt: (0, pg_core_1.timestamp)("createdAt", { withTimezone: false }),
    scannedAt: (0, pg_core_1.timestamp)("scannedAt", { withTimezone: false }),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt", { withTimezone: false }),
    zoneId: (0, pg_core_1.text)("zoneId"),
    tracking: (0, pg_core_1.text)("tracking"),
    code: (0, pg_core_1.text)("code"),
    delivered: (0, pg_core_1.boolean)("delivered"),
    current: (0, pg_core_1.boolean)("current"),
    returnRequested: (0, pg_core_1.boolean)("return_requested"),
});
exports.Zone = (0, pg_core_1.pgTable)("Zone", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    zoneName: (0, pg_core_1.text)("zoneName"),
    agencyId: (0, pg_core_1.text)("agencyId"),
});
//# sourceMappingURL=orgSchema.js.map