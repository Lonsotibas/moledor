import { Chat } from "~/server/models/chat.model";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const chat = await Chat.findOne({ _id: id });

  return chat;
});
