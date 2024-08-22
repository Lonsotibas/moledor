import { Schema, model } from "mongoose";

const MessageSchema = new Schema({
  message: String,
  senderId: String,
  receiverId: String,
  chatId: { type: Schema.Types.ObjectId, ref: "Chat" },
  createdAt: Date,
  readtAt: Date,
});

export const Message = model("Message", MessageSchema);
