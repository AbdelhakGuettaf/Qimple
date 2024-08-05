"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./lib/config");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = require("../../schema/schema");
const postgres = require("postgres");
const expressWs = require("express-ws");
const express = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const env = require("dotenv");
const date_fns_1 = require("date-fns");
process.on("uncaughtException", function (err) {
    console.log(err);
});
env.config();
const connectionString = process.env.DATABASE_URL;
const orgConnectionString = process.env.ORG_URL;
const client = postgres(connectionString);
const orgClient = postgres(orgConnectionString, { debug: true });
const db = (0, postgres_js_1.drizzle)(client, { schema: schema });
const orgDb = (0, postgres_js_1.drizzle)(orgClient);
const app = express();
const wsapp = expressWs(app);
const rooms = new Map();
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    app.use((err, req, res, next) => {
        console.error(err);
        next();
    });
    app.use(express.json());
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.get("/status", (req, res) => {
        res.status(200).send("OK");
    });
    const joinRoom = (id, uuid, ws, mode) => {
        console.log(id, uuid, mode, "joined");
        if (!rooms.has(id)) {
            rooms.set(id, new Map());
        }
        if (!rooms.get(id).has(uuid)) {
            rooms.get(id).set(uuid, { ws, mode });
        }
        NotifyUserList(id);
    };
    function NotifyUserList(id) {
        var _a;
        (_a = rooms.get(id)) === null || _a === void 0 ? void 0 : _a.forEach((s, mkey) => {
            if (s.mode) {
                return;
            }
            const res = [];
            rooms.get(id).forEach((ns, key) => {
                if (key === mkey)
                    return;
                res.push({ uuid: key, mode: ns.mode });
            });
            s.ws.send(JSON.stringify({ action: "updateList", data: res, success: true }));
        });
    }
    setInterval(() => { var _a; return console.log((_a = rooms.get("2")) === null || _a === void 0 ? void 0 : _a.keys()); }, 3000);
    const leaveRoom = (id, uuid) => {
        var _a;
        if (!id) {
            rooms.forEach((r, key) => {
                if (r.has(uuid)) {
                    NotifyUserList(key);
                    if ((r === null || r === void 0 ? void 0 : r.size) === 1) {
                        rooms.delete(key);
                        return;
                    }
                    r.delete(uuid);
                }
            });
            return;
        }
        if (((_a = rooms.get(id)) === null || _a === void 0 ? void 0 : _a.size) === 1) {
            rooms.delete(id);
            return;
        }
        if (rooms.has(id)) {
            if (rooms.get(id).has(uuid)) {
                rooms.get(id).delete(uuid);
            }
            else {
                console.log(`Unexpected error: UUID not found in room ${uuid}`);
            }
        }
        else {
            console.log(`Unexpected error: Room not found ${id}`);
        }
        NotifyUserList(id);
    };
    app.get("/updateEmployees", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.query.agency) {
            res.status(400).send("Missing agency");
            return;
        }
        try {
            const { status, data } = yield config_1.rhApi.get(`/agencyEmployees?agency=${req.query.agency}`);
            if (status !== 200) {
                res.status(500).send(`RH API Request Error, Statu: ${status}`);
                return;
            }
            res.status(200).json(data.data);
            return;
        }
        catch (e) {
            console.log(e);
            res.status(500).send(e);
            return;
        }
    }));
    app.post("/createOrder", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { comment, trackings, userId, agencyName } = req.body;
        if (!userId || !trackings.length || !agencyName) {
            res.status(400).json({ success: false, message: "Invalid request body" });
            return;
        }
        const today = new Date();
        const startOfToday = (0, date_fns_1.formatISO)((0, date_fns_1.startOfDay)(today));
        const endOfToday = (0, date_fns_1.formatISO)((0, date_fns_1.endOfDay)(today));
        let ticket = null;
        let orderId = null;
        try {
            const agency = yield db
                .select()
                .from(schema.agencies)
                .where((0, drizzle_orm_1.eq)(schema.agencies.name, agencyName))
                .execute();
            if (!agency[0]) {
                res.status(400).json({ success: false, message: "Agency not found" });
                return;
            }
            const orderCount = yield db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema.orders)
                .where((0, drizzle_orm_1.sql) `"created_at" >= ${startOfToday} AND "created_at" <= ${endOfToday} AND "agencyId" = ${agency[0].id}`)
                .execute();
            const order = yield db
                .insert(schema.orders)
                .values({
                comment,
                createdBy: userId,
                ticket: orderCount[0].count + 1,
                clientName: (_a = trackings[0]) === null || _a === void 0 ? void 0 : _a.name,
                agencyId: agency[0].id,
            })
                .returning();
            orderId = order[0].id;
            yield db
                .insert(schema.orderParcel)
                .values(trackings.map((tracking) => (Object.assign(Object.assign({}, tracking), { orderId: order[0].id, client: tracking.name }))))
                .returning();
            ticket = orderCount[0].count + 1;
            const aid = agency[0].id.toString();
            if (rooms.has(aid)) {
                console.log("sending to", aid);
                rooms.get(aid).forEach((cl) => {
                    cl.ws.send(JSON.stringify({
                        action: "update",
                        data: null,
                        success: true,
                    }));
                });
            }
        }
        catch (e) {
            console.log("line 91 \n", e);
            res.status(500).json({ success: false, message: "Internal server error" });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Order created successfully",
            ticket,
            id: orderId.toString(),
        });
        return;
    }));
    wsapp.app.ws("/socket", (ws, req) => {
        console.log("$$$$$$$$$$$$$$$");
        const uuid = crypto.randomUUID();
        console.log("new", uuid);
        ws.on("close", () => {
            console.log(uuid, "disconnected");
            leaveRoom(null, uuid);
        });
        const mode = req.query.mode;
        if (req.query.a_id) {
            joinRoom(req.query.a_id, uuid, ws, mode);
            return;
        }
        ws.on("message", (msg) => __awaiter(void 0, void 0, void 0, function* () {
            if (msg.toString().startsWith("leave")) {
                const room = msg.toString().split("#")[1];
                if (!room || !rooms[room]) {
                    return;
                }
                leaveRoom(room, uuid);
            }
            if (msg.toString().startsWith("a_id")) {
                const id = msg.toString().split("#")[1];
                if (!id) {
                    ws.send(JSON.stringify({
                        action: "a_id",
                        data: "",
                        message: "Code missing",
                        success: false,
                    }));
                    return;
                }
                const agency = yield db
                    .select()
                    .from(schema.agencies)
                    .where((0, drizzle_orm_1.eq)(schema.agencies.network, id));
                if (agency.length) {
                    const a_id = agency[0].id;
                    joinRoom(a_id.toString(), uuid, ws);
                    ws.send(JSON.stringify({
                        action: "a_id",
                        data: a_id,
                        success: true,
                    }));
                    ws.send(JSON.stringify({
                        action: "a_id",
                        data: null,
                        success: false,
                        message: "Cannot join room",
                    }));
                    return;
                }
                ws.send(JSON.stringify({
                    action: "a_id",
                    data: null,
                    success: false,
                    message: "Code invalid",
                }));
                return;
            }
            ws.send(`echo: ${msg}`);
        }));
    });
    app.get("/updateEmployees", (req, res) => __awaiter(void 0, void 0, void 0, function* () { }));
    app.listen(config_1.port);
    console.info(`Listening on port ${config_1.port}`);
});
start();
//# sourceMappingURL=index.js.map