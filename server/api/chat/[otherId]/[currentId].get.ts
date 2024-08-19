import { Chat } from "../../../models/chat.model";

export default defineEventHandler(async (event) => {
  const otherId = getRouterParam(event, "otherId");
  const currentId = getRouterParam(event, "currentId");
  const filters = {
    $and: [{ "users.userId": currentId }, { "users.userId": otherId }],
  };
  const chat = Chat.findOne(filters);

  return chat;
});
