import { User } from "@/server/models/user.model";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = body.userId;
  const otherUserId = body.otherUserId;
  const update = {
    $push: { blocked: { userId: otherUserId } },
  };
  const filter = { _id: userId };
  const user = await User.findOneAndUpdate(filter, update);

  return user;
});
