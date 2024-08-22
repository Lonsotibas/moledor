import { Chat } from "~/server/models/chat.model";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const filters = {
    _id: {
      $in: id,
    },
  };
  const chats = Chat.find(filters).populate("user").exec();

  return chats;
});
