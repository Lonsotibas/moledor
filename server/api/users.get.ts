import { User } from "../models/user.model";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const limit = Math.min(Number(query.limit) || 50, 100);
    const skip = Number(query.skip) || 0;
    const currentUserId = query.userId as string | undefined;

    let excludeIds: string[] = [];

    if (currentUserId) {
      const me = await User.findById(currentUserId).select("blocked");
      const blockedByMe = (me?.blocked || [])
        .map((b: any) => b.userId?.toString())
        .filter(Boolean);

      const blockedMe = await User.find({ "blocked.userId": currentUserId }).select("_id");
      const blockedMeIds = blockedMe.map((u: any) => u._id.toString());

      excludeIds = [...new Set([...blockedByMe, ...blockedMeIds, currentUserId])];
    }

    const filter = excludeIds.length ? { _id: { $nin: excludeIds } } : {};
    const users = await User.find(filter).skip(skip).limit(limit).select("-pass");
    return users;
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
