import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  nombre: { type: String || null, unique: true },
  pass: String,
  pronombre: String || null,
  medidas: {
    estatura: Number || null,
    peso: Number || null,
  },
  edad: Number || null,
  rol: String || null,
  distancia: Number || null,
  genero: String || null,
  etnia: String || null,
  estadoCivil: String || null,
  busca: Array<String> || null,
  encuentro: Array<String> || null,
  salud: {
    vacunas: Array<String> || null,
    vih: Boolean || null,
    prep: Boolean || null,
  },
  tags: Array<String> || null,
  chats: [
    { chatId: { type: Schema.Types.ObjectId, ref: "Chat" }, lastMsg: String },
  ],
  photos: Array<String> || null,
});

export const User = model("User", UserSchema);
