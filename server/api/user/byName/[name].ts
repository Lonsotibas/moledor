import { User } from "~/server/models/user.model";

export default defineEventHandler(async (event) => {
  try {
    const name = getRouterParam(event, "name");
    const user = await User.findOne({ nombre: String(name) }).select("-pass");
    return user;
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
