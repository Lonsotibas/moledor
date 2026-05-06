import { User } from "../models/user.model";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const update = {
      nombre: body.name,
      acerca: body.acerca,
      genero: body.gender,
      pronombre: body.pronoun,
      medidas: {
        estatura: body.height,
        peso: body.weight,
      },
      edad: body.age,
      rol: body.rol,
      distancia: body.distancia,
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
      photos: body.photos,
    };
    const user = await User.findByIdAndUpdate(body._id, update, { new: true }).select("-pass");
    return user;
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
