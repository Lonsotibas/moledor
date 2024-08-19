import { Schema, model } from "mongoose";

const ChatSchema = new Schema({
  createdAt: Date,
  lastModified: Date,
  users: [{ userId: Schema.Types.ObjectId, totalUnread: Number }],
});

export const Chat = model("Chat", ChatSchema);
