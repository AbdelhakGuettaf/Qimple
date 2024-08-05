import { port, rhApi } from "./lib/config"

import { drizzle } from "drizzle-orm/postgres-js"
import {} from "postgres"
import * as schema from "../../schema/schema"
import * as orgSchema from "../../schema/orgSchema"
import * as postgres from "postgres"

import expressWs = require("express-ws")

import express = require("express")

// import session = require("express-session");

import { count, eq, sql } from "drizzle-orm"

import * as env from "dotenv"

import { formatISO, startOfDay, endOfDay } from "date-fns"
import { Mode } from "./lib/types"

import { WebSocket } from "ws"

import router from "./routes"
import { FetchEmployees } from "./lib/utils"

process.on("uncaughtException", function (err) {
  console.log(err)
})

env.config()

const connectionString = process.env.DATABASE_URL

const orgConnectionString = process.env.ORG_URL

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString)

const orgClient = postgres(orgConnectionString)

const db = drizzle(client, { schema: schema })

const orgDb = drizzle(orgClient)

const app = express()

const wsapp = expressWs(app)

const rooms: Map<
  string,
  Map<string, { ws: WebSocket; mode?: Mode }>
> = new Map()

const start = async () => {
  app.use((err, req, res, next) => {
    console.error(err)
    next()
  })

  app.use(express.json())

  // app.use(express.urlencoded({extended: false}))

  // app.use(session({
  //   secret: 'rappelzisgoat',
  //   resave: false,
  //   saveUninitialized: true,
  //   cookie: { secure: true }
  // }))

  // app.use()
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    )
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    )
    next()
  })

  app.get("/status", (req, res) => {
    res.status(200).send("OK")
  })

  const joinRoom = (id: string, uuid: string, ws: WebSocket, mode?: Mode) => {
    console.log(id, uuid, mode, "joined")
    if (!rooms.has(id)) {
      rooms.set(id, new Map())
    }

    if (!rooms.get(id).has(uuid)) {
      rooms.get(id).set(uuid, { ws, mode })
    }
    NotifyUserList(id)
  }
  /**
   * Everytime someone joins a room, the clients without a mode recieves the clients list
   */
  function NotifyUserList(id: string) {
    rooms.get(id)?.forEach((s, mkey) => {
      if (s.mode) {
        return
      }

      const res: { uuid: string; mode: Mode }[] = []

      rooms.get(id).forEach((ns, key) => {
        if (key === mkey) return
        res.push({ uuid: key, mode: ns.mode })
      })

      s.ws.send(
        JSON.stringify({ action: "updateList", data: res, success: true })
      )
    })
  }

  setInterval(() => console.log(rooms.get("2")?.keys()), 3000)

  const leaveRoom = (id: string | null, uuid: string) => {
    if (!id) {
      rooms.forEach((r, key) => {
        if (r.has(uuid)) {
          NotifyUserList(key)

          if (r?.size === 1) {
            rooms.delete(key)
            return
          }
          r.delete(uuid)
        }
      })
      return
    }

    if (rooms.get(id)?.size === 1) {
      rooms.delete(id)
      return
    }

    if (rooms.has(id)) {
      if (rooms.get(id).has(uuid)) {
        rooms.get(id).delete(uuid)
      } else {
        console.log(`Unexpected error: UUID not found in room ${uuid}`)
      }
    } else {
      console.log(`Unexpected error: Room not found ${id}`)
    }

    NotifyUserList(id)
  }

  app.get("/updateEmployees", async (req, res) => {
    if (!req.query.agency) {
      res.status(400).send("Missing agency")
      return
    }

    try {
      const { status, data } = await rhApi.get(
        `/agencyEmployees?agency=${req.query.agency}`
      )

      if (status !== 200) {
        res.status(500).send(`RH API Request Error, Statu: ${status}`)
        return
      }

      res.status(200).json(data.data)
      return
    } catch (e) {
      console.log(e)
      res.status(500).send(e)
      return
    }
  })

  app.post("/createOrder", async (req, res) => {
    const { comment, trackings, userId, agencyName } = req.body as {
      trackings: {
        tracking: string
        comment: string
        name: string
        packages: string
        pos?: string
        cr?: string
        origin?: string
      }[]
      comment: string | undefined | null
      userId: string
      agencyName: string | undefined
    }

    if (!userId || !trackings.length || !agencyName) {
      res.status(400).json({ success: false, message: "Invalid request body" })
      return
    }

    const today = new Date()
    const startOfToday = formatISO(startOfDay(today))
    const endOfToday = formatISO(endOfDay(today))

    let ticket: number | null = null
    let orderId: number | null = null

    try {
      const agency = await db
        .select()
        .from(schema.agencies)
        .where(eq(schema.agencies.name, agencyName))
        .execute()

      if (!agency[0]) {
        res.status(400).json({ success: false, message: "Agency not found" })
        return
      }

      const orderCount = await db
        .select({ count: count() })
        .from(schema.orders)
        .where(
          sql`"created_at" >= ${startOfToday} AND "created_at" <= ${endOfToday} AND "agencyId" = ${agency[0].id}`
        )
        .execute()

      const order = await db
        .insert(schema.orders)
        .values({
          comment,
          createdBy: userId,
          ticket: orderCount[0].count + 1,
          clientName: trackings[0]?.name,
          agencyId: agency[0].id,
        })
        .returning()

      orderId = order[0].id

      await db
        .insert(schema.orderParcel)
        .values(
          trackings.map((tracking) => ({
            ...tracking,
            orderId: order[0].id,
            client: tracking.name,
          }))
        )
        .returning()

      ticket = orderCount[0].count + 1

      const aid = agency[0].id.toString()

      if (rooms.has(aid)) {
        console.log("sending to", aid)
        rooms.get(aid).forEach((cl) => {
          cl.ws.send(
            JSON.stringify({
              action: "update",
              data: null,
              success: true,
            })
          )
        })
      }
    } catch (e) {
      console.log("line 91 \n", e)

      res.status(500).json({ success: false, message: "Internal server error" })

      return
    }

    // wsapp.getWss().clients.forEach((client) => client.);

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      ticket,
      id: orderId.toString(),
    })
    return
  })

  wsapp.app.ws("/socket", (ws, req) => {
    console.log("$$$$$$$$$$$$$$$")

    const uuid = crypto.randomUUID()

    console.log("new", uuid)

    ws.on("close", () => {
      console.log(uuid, "disconnected")
      leaveRoom(null, uuid)
    })

    const mode = req.query.mode as Mode

    if (req.query.a_id) {
      joinRoom(req.query.a_id as string, uuid, ws, mode)
      return
    }

    ws.on("message", async (msg) => {
      if (msg.toString().startsWith("leave")) {
        const room = msg.toString().split("#")[1]

        if (!room || !rooms[room]) {
          return
        }

        leaveRoom(room, uuid)
      }

      if (msg.toString().startsWith("a_id")) {
        const id = msg.toString().split("#")[1]

        console.log("Identification attempt", msg)

        if (!id) {
          ws.send(
            JSON.stringify({
              action: "a_id",
              data: "",
              message: "Code missing",
              success: false,
            })
          )

          return
        }

        try {
          const agency = await db
            .select()
            .from(schema.agencies)
            .where(eq(schema.agencies.network, id))

          if (agency.length) {
            const a_id = agency[0].id

            joinRoom(a_id.toString(), uuid, ws)

            ws.send(
              JSON.stringify({
                action: "a_id",
                data: a_id,
                success: true,
              })
            )
          }
        } catch (e) {
          console.log(e)
          ws.send(
            JSON.stringify({
              action: "a_id",
              data: null,
              success: false,
              error: "Internal server error",
            })
          )
        }
        // const uuid = crypto.randomUUID();

        // try {
        //   await db
        //     .update(schema.users)
        //     .set({ uuid: uuid, uui_exp: new Date(Date.now() + 86400000) }).where(schema.users)
        // } catch (e) {
        //   console.log(e);
        //   ws.send(
        //     JSON.stringify({
        //       action: "a_id",
        //       data: null,
        //       success: false,
        //       error: "Internal server error",
        //     })
        //   );
        //   return;
        // }

        ws.send(
          JSON.stringify({
            action: "a_id",
            data: null,
            success: false,
            message: "Code invalid or no agency",
          })
        )
        return
      }
    })
  })

  app.get("/updateEmployees", async (req, res) => {})

  app.listen(port)
  console.info(`Listening on port ${port}`)
}

start()
