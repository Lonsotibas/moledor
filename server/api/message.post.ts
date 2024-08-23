import { now } from "mongoose";
import { Message } from "~/server/models/message.model";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const message = new Message({
    message: body.message,
    senderId: body.senderId,
    receiverId: body.receiverId,
    chatId: body.chatId,
    createdAt: now(),
  });

  const response = message.save();

  return response;
});
