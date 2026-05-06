import { Chat } from "../../../models/chat.model";

export default defineEventHandler(async (event) => {
  try {
    const otherId = getRouterParam(event, "otherId");
    const currentId = getRouterParam(event, "currentId");
    const chat = await Chat.findOne({
      $and: [{ "users.userId": currentId }, { "users.userId": otherId }],
    });
    return chat;
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
