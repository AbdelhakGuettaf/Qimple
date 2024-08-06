import { WebSocket } from "ws"

export type Mode = "caisse" | "transfert" | "depot" | undefined

export type WsObj = WebSocket

export type RhEmployee = {
  id: string
  name: string
  title: string
}
