import { verifyPassword } from "~/server/utils/password";
import { User } from "~/server/models/user.model";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { name, pass } = body;

    if (!name || !pass) {
      throw createError({ statusCode: 400, message: "Nombre y contraseña requeridos" });
    }

    const user = await User.findOne({ nombre: String(name) });
    if (!user || !user.pass) {
      throw createError({ statusCode: 401, message: "Credenciales inválidas" });
    }

    const valid = verifyPassword(String(pass), user.pass);
    if (!valid) {
      throw createError({ statusCode: 401, message: "Credenciales inválidas" });
    }

    const userObj = user.toObject() as Record<string, unknown>;
    delete userObj.pass;
    return userObj;
  } catch (err: any) {
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
