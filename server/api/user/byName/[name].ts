import { User } from "~/server/models/user.model";

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, "name");
  const user = await User.findOne({ nombre: name });

  return user;
});
