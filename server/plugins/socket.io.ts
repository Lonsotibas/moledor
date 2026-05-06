import type { NitroApp } from "nitropack";
import { Server as Engine } from "engine.io";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_MIME: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  audio: ["audio/webm"],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const engine = new Engine();
  const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
  const io = new Server({ cors: { origin: allowedOrigin }, maxHttpBufferSize: 1e8 });

  io.bind(engine);

  io.on("connection", (socket) => {
    console.log("Chat conectado");

    socket.on("join", (userId: string) => {
      if (userId) socket.join(userId);
    });

    socket.on("message", async (value) => {
      if (value.receiverId) io.to(value.receiverId).emit("message", value);
      if (value.senderId) io.to(value.senderId).emit("message", value);
    });

    socket.on(
      "upload",
      (fileBuffer: ArrayBuffer, meta: any, callback: Function) => {
        const { type, mimeType, senderId, receiverId, chatId } = meta;

        if (!ALLOWED_MIME[type]?.includes(mimeType)) {
          return callback({ success: false, error: "Tipo de archivo no permitido" });
        }

        const buffer = Buffer.from(fileBuffer);
        if (buffer.byteLength > MAX_FILE_SIZE) {
          return callback({ success: false, error: "Archivo demasiado grande" });
        }

        const extension = type === "image" ? mimeType.split("/")[1] : "webm";
        const filename = `${uuidv4()}.${extension}`;
        const uploadPath = path.join(process.cwd(), "uploads", filename);

        fs.writeFile(uploadPath, buffer, (err) => {
          if (err) return callback({ success: false });

          const mediaUrl = `/uploads/${filename}`;
          const msg = { senderId, receiverId, chatId, mediaUrl, mediaType: type };

          if (receiverId) io.to(receiverId).emit("message", msg);
          if (senderId) io.to(senderId).emit("message", msg);

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
