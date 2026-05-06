import { User } from "../models/user.model";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const limit = Math.min(Number(query.limit) || 50, 100);
    const skip = Number(query.skip) || 0;
    const users = await User.find().skip(skip).limit(limit);
    return users;
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
