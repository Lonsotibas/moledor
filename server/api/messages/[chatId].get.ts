import { Message } from "~/server/models/message.model";

export default defineEventHandler(async (event) => {
  const chatId = getRouterParam(event, "chatId");

  const response = Message.find({ chatId: chatId });

  return response;
});
