import { User } from "../models/user.model";

export default defineEventHandler(async (event) => {
    const body = readBody(event)
    const users = await User.findOne({_id: body.id});

    return users;
});
