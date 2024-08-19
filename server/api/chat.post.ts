import { now } from "mongoose";
import { Chat } from "../models/chat.model";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const chat = new Chat({
    createdAt: now(),
    lastModified: now(),
    users: [
      { userId: body.currentUserId, totalUnread: 0 },
      { userId: body.otherUserId, totalUnread: 1 },
    ],
  });

  return chat.save();
});
