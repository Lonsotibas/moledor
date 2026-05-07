import { User } from "~/server/models/user.model";

export default defineEventHandler(async (event) => {
  const { userId } = await readBody(event);
  if (!userId) throw createError({ statusCode: 400, message: "userId requerido" });

  await User.findByIdAndUpdate(userId, { isSim: true });
  return { ok: true };
});
