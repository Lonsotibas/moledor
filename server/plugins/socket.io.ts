import type { NitroApp } from "nitropack";
import { Server as Engine } from "engine.io";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_MIME: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  audio: ["audio/webm", "audio/mp4", "audio/ogg", "audio/aac"],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const engine = new Engine();
  const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
  const io = new Server({ cors: { origin: allowedOrigin }, maxHttpBufferSize: 1e8 });

  io.bind(engine);

  // Expose io for use in API routes (e.g. sim/emit)
  (nitroApp as any)._io = io;

  io.on("connection", (socket) => {
    console.log("Chat conectado");

    socket.on("join", (userId: string) => {
      if (userId) socket.join(userId);
    });

    socket.on("message", async (value) => {
      if (value.receiverId) io.to(value.receiverId).emit("message", value);
      if (value.senderId) io.to(value.senderId).emit("message", value);
    });

    socket.on("fire", (data: any) => {
      if (data.toUserId) io.to(data.toUserId).emit("fire", data);
    });

    socket.on(
      "upload",
      (fileBuffer: ArrayBuffer, meta: any, callback: Function) => {
        const { type, mimeType, senderId, receiverId, chatId } = meta;

        const baseMime = mimeType.split(";")[0].trim();
        if (!ALLOWED_MIME[type]?.includes(baseMime)) {
          return callback({ success: false, error: "Tipo de archivo no permitido" });
        }

        const buffer = Buffer.from(fileBuffer);
        if (buffer.byteLength > MAX_FILE_SIZE) {
          return callback({ success: false, error: "Archivo demasiado grande" });
        }

        const extension = baseMime.split("/")[1];
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
          const nodeContext = peer.ctx?.node;
          if (!nodeContext?.req || !nodeContext?.ws) return;

          // @ts-expect-error private method
          engine.prepare(nodeContext.req);

          // @ts-expect-error private method
          engine.onWebSocket(nodeContext.req, nodeContext.req.socket, nodeContext.ws);
        },
      },
    })
  );
});
