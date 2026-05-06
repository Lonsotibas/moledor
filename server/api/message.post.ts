import { now } from "mongoose";
import { Message } from "~/server/models/message.model";
import { Chat } from "~/server/models/chat.model";

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
    const saved = await message.save();

    if (body.chatId && body.receiverId) {
      await Chat.updateOne(
        { _id: body.chatId, "users.userId": body.receiverId },
        { $inc: { "users.$.totalUnread": 1 } }
      );
    }

    return saved;
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
