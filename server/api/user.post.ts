import { hashPassword } from "~/server/utils/password";
import { User } from "../models/user.model";

const num = (v: unknown) => {
  const n = Number(v);
  return v === "" || v === null || v === undefined || isNaN(n) ? null : n;
};

const str = (v: unknown) =>
  v === "" || v === null || v === undefined ? null : String(v);

const arr = (v: unknown) =>
  Array.isArray(v) ? v.filter((s) => s !== "") : [];

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.name || !body.pass) {
      throw createError({ statusCode: 400, message: "Nombre y contraseña requeridos" });
    }

    const hashed = hashPassword(String(body.pass));

    let user = new User({
      nombre: body.name,
      pass: hashed,
      genero: str(body.gender),
      pronombre: str(body.pronoun),
      medidas: {
        estatura: num(body.height),
        peso: num(body.weight),
      },
      edad: num(body.age),
      rol: str(body.rol),
      etnia: str(body.ethnicity),
      estadoCivil: str(body.rel_status),
      busca: arr(body.search),
      encuentro: arr(body.encounter),
      salud: {
        vacunas: arr(body.vaccines),
        vih: str(body.vih),
        prep: str(body.prep),
      },
      tags: arr(body.tags),
      photos: Array.isArray(body.photos) ? body.photos.filter(Boolean) : [],
      simPersonality: str(body.simPersonality),
      simType: str(body.simType),
    });

    user = await user.save();
    const userObj = user.toObject() as Record<string, unknown>;
    delete userObj.pass;
    return userObj;
  } catch (err: any) {
    if (err.statusCode) throw err;
    if (err.code === 11000) {
      throw createError({ statusCode: 409, message: "El nombre de usuario ya existe" });
    }
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
