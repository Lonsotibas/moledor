import type { NitroApp } from "nitropack";
import { Server as Engine } from "engine.io";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const engine = new Engine();
  const io = new Server({ cors: { origin: "*" }, maxHttpBufferSize: 1e8 });

  io.bind(engine);

  io.on("connection", (socket) => {
    console.log("Chat conectado");
    socket.on("message", async (value) => {
      console.log("Envia mensaje");
      io.emit("message", value);
    });

    socket.on(
      "upload",
      (fileBuffer: ArrayBuffer, meta: any, callback: Function) => {
        const { type, mimeType, senderId, receiverId, chatId } = meta;

        const extension = type === "image" ? mimeType.split("/")[1] : "webm";
        const filename = `${uuidv4()}.${extension}`;
        const uploadPath = path.join(process.cwd(), "uploads", filename);

        fs.writeFile(uploadPath, Buffer.from(fileBuffer), (err) => {
          if (err) return callback({ success: false });

          const mediaUrl = `/uploads/${filename}`;
          io.emit("message", {
            senderId,
            receiverId,
            chatId,
            mediaUrl,
            mediaType: type,
          });

          callback({ success: true, url: mediaUrl });
        });
      }
    );

    socket.on("disconnect", () => {
      console.log("Chat desconectado");
    });
  });

  nitroApp.router.use(
    "/socket.io/",
    defineEventHandler({
      handler(event) {
        engine.handleRequest(event.node.req, event.node.res);
        event._handled = true;
      },
      websocket: {
        open(peer) {
          const nodeContext = peer.ctx.node;
          const req = nodeContext.req;

          // @ts-expect-error private method
          engine.prepare(req);

          const rawSocket = nodeContext.req.socket;
          const websocket = nodeContext.ws;

          // @ts-expect-error private method
          engine.onWebSocket(req, rawSocket, websocket);
        },
      },
    })
  );
});
