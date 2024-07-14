import { port } from "./lib/config";

import { drizzle } from "drizzle-orm/postgres-js";
import {} from "postgres";
import * as schema from "../../schema/schema";
import * as orgSchema from "../../schema/orgSchema";
import * as postgres from "postgres";

import expressWs = require("express-ws");

import express = require("express");

// import session = require("express-session");

import { count, eq, sql } from "drizzle-orm";

import * as env from "dotenv";

import { formatISO, startOfDay, endOfDay } from "date-fns";

process.on("uncaughtException", function (err) {
  console.log(err);
});

env.config();

const connectionString = process.env.DATABASE_URL;

const orgConnectionString = process.env.ORG_URL;

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString);

const orgClient = postgres(orgConnectionString, { debug: true });

const db = drizzle(client, { schema: schema });

const orgDb = drizzle(orgClient);

const app = express();

const wsapp = expressWs(app);

const start = async () => {
  app.use((err, req, res, next) => {
    console.error(err);
    next();
  });

  app.use(express.json());

  // app.use(express.urlencoded({extended: false}))

  // app.use(session({
  //   secret: 'rappelzisgoat',
  //   resave: false,
  //   saveUninitialized: true,
  //   cookie: { secure: true }
  // }))

  // app.use()
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  app.get("/status", (req, res) => {
    res.status(200).send("OK");
  });

  app.post("/createOrder", async (req, res) => {
    const { comment, trackings, userId } = req.body as {
      trackings: {
        tracking: string;
        comment: string;
        name: string;
        packages: string;
      }[];
      comment: string | undefined | null;
      userId: string;
    };

    if (!userId || !trackings.length) {
      res.status(400).json({ success: false, message: "Invalid request body" });
      return;
    }

    const today = new Date();
    const startOfToday = formatISO(startOfDay(today));
    const endOfToday = formatISO(endOfDay(today));

    let ticket: number | null = null;
    let orderId: number | null = null;

    try {
      const orderCount = await db
        .select({ count: count() })
        .from(schema.orders)
        .where(
          sql`"created_at" >= ${startOfToday} AND "created_at" <= ${endOfToday}`
        )
        .execute();

      const order = await db
        .insert(schema.orders)
        .values({
          comment,
          createdBy: userId,
          ticket: orderCount[0].count + 1,
          clientName: trackings[0]?.name,
        })
        .returning();

      orderId = order[0].id;

      await db
        .insert(schema.orderParcel)
        .values(
          trackings.map((tracking) => ({ ...tracking, orderId: order[0].id }))
        )
        .returning();

      ticket = orderCount[0].count + 1;
    } catch (e) {
      console.log("line 91 \n", e);

      res
        .status(500)
        .json({ success: false, message: "Internal server error" });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      ticket,
      id: orderId.toString(),
    });
    return;
  });

  wsapp.app.ws("/socket", (ws, req) => {
    ws.on("message", (msg) => {
      if (msg.toString().startsWith("a_id")) {
        //
        console.log("yoooo");
        ws.send(JSON.stringify({ action: "a_id", data: "thisyoid" }));
        return;
      }
      ws.send(`echo: ${msg}`);
    });

    ws.send("connected");
  });

  app.listen(port);
  console.info(`Listening on port ${port}`);
};

start();
