import { Chat } from "~/server/models/chat.model";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const chatIds = Array.isArray(body.chatIds) ? body.chatIds : [];
    const chats = await Chat.find({ _id: { $in: chatIds } }).populate({
      path: "users",
      populate: { path: "userId" },
    });
    return chats;
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
