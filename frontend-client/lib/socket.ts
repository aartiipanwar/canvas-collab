import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SOCKET_URL : "http://localhost:5000";

export const socket: Socket = io(SOCKET_SERVER_URL!, {
  transports: ["websocket", "polling"],
});