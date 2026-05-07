import { Chat } from "~~/server/models/chat.model";
import { User } from "~~/server/models/user.model";

export default defineEventHandler(async () => {
  const sims = await User.find({ isSim: true }, { _id: 1 });
  const simIds = sims.map((s) => s._id);

  const chats = await Chat.find({ "users.userId": { $in: simIds } })
    .populate("users.userId", "nombre photos isSim")
    .sort({ lastModified: -1 })
    .limit(100)
    .lean();

  return chats;
});
