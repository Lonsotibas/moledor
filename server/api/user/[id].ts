import { User } from "../../models/user.model";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const user = await User.findOne({ _id: id });

  return user;
});
