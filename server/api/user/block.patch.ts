import { User } from "@/server/models/user.model";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const update = {
      $push: { blocked: { userId: body.otherUserId } },
    };
    const user = await User.findByIdAndUpdate(body.userId, update);
    return user;
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
