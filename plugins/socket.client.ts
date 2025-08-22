import { io, Socket } from "socket.io-client";

export default defineNuxtPlugin(() => {
  const socket: Socket = io("https:localhost:3000", {
    transports: ["websocket"],
  });

  return {
    provide: { socket },
  };
});
