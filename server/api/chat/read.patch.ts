import { Chat } from "~/server/models/chat.model";

export default defineEventHandler(async (event) => {
  try {
    const { chatId, userId } = await readBody(event);
    if (!chatId || !userId) return { ok: false };
    await Chat.updateOne(
      { _id: chatId, "users.userId": userId },
      { $set: { "users.$.totalUnread": 0 } }
    );
    return { ok: true };
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
