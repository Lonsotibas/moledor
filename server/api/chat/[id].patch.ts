import { now } from "mongoose";
import { Chat } from "~/server/models/chat.model";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const filter = { _id: id };
  const update = {
    lastMessage: body.lastMessage,
    lastModified: now(),
  };
  const chat = Chat.findOneAndUpdate(filter, update);
  return chat;
});
