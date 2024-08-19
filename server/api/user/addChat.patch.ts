import { User } from "../../models/user.model";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const usersId = body.usersId;
  const update = {
    $push: { chats: { chatId: body.chatId } },
  };
  const filter = { _id: { $in: usersId } };
  const user = await User.updateMany(filter, update);

  return user;
});
