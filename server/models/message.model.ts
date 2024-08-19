import { Schema, model } from "mongoose";

const MessageSchema = new Schema({
  message: String,
  senderId: String,
  receiverId: String,
  chatId: String,
  createdAt: Date,
  readtAt: Date,
});

export const Message = model("Message", MessageSchema);
