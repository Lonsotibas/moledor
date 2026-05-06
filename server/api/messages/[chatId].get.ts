import { Message } from "~/server/models/message.model";

export default defineEventHandler(async (event) => {
  try {
    const chatId = getRouterParam(event, "chatId");
    const messages = await Message.find({ chatId });
    return messages;
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
