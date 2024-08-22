import { User } from "../models/user.model";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  let user = new User({
    nombre: body.name,
    pass: body.pass,
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
  });
  user = await user.save();

  return user;
});
