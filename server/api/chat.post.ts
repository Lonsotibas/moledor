import { now } from "mongoose";
import { Chat } from "../models/chat.model";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const chat = new Chat({
      createdAt: now(),
      lastModified: now(),
      users: [
        { userId: body.currentUserId, totalUnread: 0 },
        { userId: body.otherUserId, totalUnread: 1 },
      ],
    });
    return await chat.save();
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
