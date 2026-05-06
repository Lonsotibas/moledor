import { User } from "@/server/models/user.model";

export default defineEventHandler(async (event) => {
  try {
    const { userId } = getQuery(event) as { userId: string };

    const usersWhoFiredMe = await User.find({
      "fires.userId": userId,
    }).select("-pass");

    const me = await User.findById(userId).select("fires");
    const myFiredIds = new Set(
      ((me?.fires as any[]) || []).map((f: any) => f.userId?.toString())
    );

    return usersWhoFiredMe.map((u: any) => ({
      ...u.toObject(),
      isMutual: myFiredIds.has(u._id.toString()),
    }));
  } catch {
    throw createError({ statusCode: 500, message: "Error del servidor" });
  }
});
