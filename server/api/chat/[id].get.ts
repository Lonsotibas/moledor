import { Chat } from "~/server/models/chat.model";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const chat = await Chat.findById(id).populate({
      path: "users",
      populate: { path: "userId" },
    });
    if (!chat) {
      throw createError({ statusCode: 404, message: "Chat no encontrado" });
    }
    return chat;
  } catch (err: any) {
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
