import { User } from "@/server/models/user.model";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const userId = query.userId as string;
    if (!userId) throw createError({ statusCode: 400, message: "userId requerido" });

    const user = await User.findById(userId)
      .select("blocked")
      .populate("blocked.userId", "-pass");

    return (user?.blocked || []).map((b: any) => b.userId).filter(Boolean);
  } catch (err: any) {
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
