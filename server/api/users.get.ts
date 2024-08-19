import { User } from "../models/user.model";

export default defineEventHandler(async (event) => {
    const users = await User.find();

    return users;
});
