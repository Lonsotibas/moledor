import { now } from "mongoose";
import { Message } from "~/server/models/message.model";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const message = new Message({
      message: body.message,
      mediaUrl: body.mediaUrl,
      mediaType: body.mediaType,
      senderId: body.senderId,
      receiverId: body.receiverId,
      chatId: body.chatId,
      createdAt: now(),
    });
    return await message.save();
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
