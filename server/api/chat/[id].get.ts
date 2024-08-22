import { Chat } from "~/server/models/chat.model";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const filters = {
    _id: {
      $in: id,
    },
  };
  const chat = Chat.findOne(filters).populate("users.userId").exec();

  return chat;
});
