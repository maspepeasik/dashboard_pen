"use client";

import { io, type Socket } from "socket.io-client";
import { publicEnv } from "./env";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(publicEnv.socketUrl, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket"]
    });
  }

  return socket;
}
