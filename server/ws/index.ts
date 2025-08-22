import type { NitroApp } from "nitropack";
import { Server, Socket } from "socket.io";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const io = new Server({
    cors: { origin: "*" },
    maxHttpBufferSize: 1e7,
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("upload", (fileBuffer: Buffer, callback: Function) => {
      const filename = `${uuidv4()}.webm`;
      const uploadDir = path.join(process.cwd(), "uploads");
      const uploadPath = path.join(uploadDir, filename);

      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

      fs.writeFile(uploadPath, fileBuffer, (err) => {
        if (err) {
          console.error(err);
          return callback({ success: false });
        }

        const mediaUrl = `/uploads/${filename}`;
        io.emit("new-message", { mediaUrl, mediaType: "audio" });

        callback({ success: true, url: mediaUrl });
      });
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
});
