import { User } from "@/server/models/user.model";

export default defineEventHandler(async (event) => {
  try {
    const { userId } = getQuery(event) as { userId: string };

    const me = await User.findById(userId)
      .select("fires")
      .populate("fires.userId", "-pass");

    const fired = ((me?.fires as any[]) || [])
      .map((f: any) => f.userId)
      .filter(Boolean);

    const firedIds = fired.map((u: any) => u._id.toString());
    const mutuals = await User.find({
      _id: { $in: firedIds },
      "fires.userId": userId,
    }).select("_id");
    const mutualSet = new Set(mutuals.map((u: any) => u._id.toString()));

    return fired.map((u: any) => ({
      ...u.toObject(),
      isMutual: mutualSet.has(u._id.toString()),
    }));
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
