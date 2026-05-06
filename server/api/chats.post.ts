import { Chat } from "~/server/models/chat.model";
import { User } from "~/server/models/user.model";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const chatIds = Array.isArray(body.chatIds) ? body.chatIds : [];
    const userId = body.userId as string | undefined;

    const chats = await Chat.find({ _id: { $in: chatIds } }).populate({
      path: "users",
      populate: { path: "userId" },
    });

    if (!userId) return chats;

    // Find which other users have blocked the current user
    const otherUserIds = chats.flatMap((chat: any) =>
      chat.users
        .filter((u: any) => u.userId?._id?.toString() !== userId)
        .map((u: any) => u.userId?._id)
        .filter(Boolean)
    );

    const usersWhoBlockedMe = await User.find({
      _id: { $in: otherUserIds },
      "blocked.userId": userId,
    }).select("_id");

    const blockedBySet = new Set(usersWhoBlockedMe.map((u: any) => u._id.toString()));

    return chats.filter((chat: any) => {
      const other = chat.users.find((u: any) => u.userId?._id?.toString() !== userId);
      const otherId = other?.userId?._id?.toString();
      return !otherId || !blockedBySet.has(otherId);
    });
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
