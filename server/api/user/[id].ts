import { User } from "../../models/user.model";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const user = await User.findById(id);
    return user;
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
