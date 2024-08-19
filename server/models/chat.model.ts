import { Schema, model } from "mongoose";

const ChatSchema = new Schema({
  createdAt: Date,
  lastModified: Date,
  users: [{ userId: String, totalUnread: Number }],
});

export const Chat = model("Chat", ChatSchema);
