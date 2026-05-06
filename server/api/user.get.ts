import { User } from "../models/user.model";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const user = await User.findById(body.id);
    return user;
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
