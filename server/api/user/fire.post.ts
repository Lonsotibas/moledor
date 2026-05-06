import { User } from "@/server/models/user.model";

export default defineEventHandler(async (event) => {
  try {
    const { userId, otherUserId } = await readBody(event);

    const me = await User.findById(userId).select("fires");
    if (!me) throw createError({ statusCode: 404, message: "Usuario no encontrado" });

    const alreadyFired = me.fires.some(
      (f: any) => f.userId?.toString() === otherUserId
    );

    if (alreadyFired) {
      const updated = await User.findByIdAndUpdate(
        userId,
        { $pull: { fires: { userId: otherUserId } } },
        { new: true }
      ).select("-pass");
      return { fired: false, isMutual: false, user: updated };
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $push: { fires: { userId: otherUserId } } },
      { new: true }
    ).select("-pass");

    const other = await User.findById(otherUserId).select("fires");
    const isMutual =
      other?.fires?.some((f: any) => f.userId?.toString() === userId) ?? false;

    return { fired: true, isMutual, user: updated };
  } catch (err: any) {
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
