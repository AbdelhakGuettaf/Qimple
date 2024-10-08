import { WebSocket } from "ws";
export type Mode = "caisse" | "transfert" | undefined;
export type WsObj = WebSocket;
export type RhEmployee = {
    id: string;
    name: string;
    title: string;
};
