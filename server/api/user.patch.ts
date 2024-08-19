import { User } from "../models/user.model";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const update = {
    nombre: body.name,
    genero: body.gender,
    pronombre: body.pronoun,
    medidas: {
      estatura: body.height,
      peso: body.weight,
    },
    edad: body.age,
    rol: body.rol,
    etnia: body.ethnicity,
    estadoCivil: body.rel_status,
    busca: body.search,
    encuentro: body.encounter,
    salud: {
      vacunas: body.vaccines,
      vih: body.vih,
      prep: body.prep,
    },
    tags: body.tags,
    chats: [
      {
        chatId: body.chatId,
        userName: body.otherUserName,
        lastMsg: String,
        totalUnread: Number,
      },
    ],
  };
  const filter = { _id: body._id };
  const user = await User.findOneAndUpdate(filter, update);

  return user;
});
