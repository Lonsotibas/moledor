import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  nombre: { type: String, unique: true },
  pass: String,
  acerca: { type: String, default: null },
  pronombre: { type: String, default: null },
  medidas: {
    estatura: { type: Number, default: null },
    peso: { type: Number, default: null },
  },
  edad: { type: Number, default: null },
  rol: { type: String, default: null },
  distancia: { type: Number, default: null },
  genero: { type: String, default: null },
  etnia: { type: String, default: null },
  estadoCivil: { type: String, default: null },
  busca: [String],
  encuentro: [String],
  salud: {
    vacunas: [String],
    vih: { type: String, default: null },
    prep: { type: String, default: null },
  },
  tags: [String],
  chats: [
    { chatId: { type: Schema.Types.ObjectId, ref: "Chat" }, lastMsg: String },
  ],
  photos: [String],
  blocked: [{ userId: { type: Schema.Types.ObjectId, ref: "User" } }],
});

export const User = model("User", UserSchema);
