import { User } from "@/server/models/user.model";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const user = await User.findByIdAndUpdate(
      body.userId,
      { $pull: { blocked: { userId: body.otherUserId } } },
      { new: true }
    ).select("-pass");
    return user;
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
