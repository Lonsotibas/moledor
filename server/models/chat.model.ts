import { Schema, model } from "mongoose";

const ChatSchema = new Schema({
  createdAt: Date,
  lastModified: Date,
  lastMessage: String,
  users: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      totalUnread: Number,
    },
  ],
});

export const Chat = model("Chat", ChatSchema);
