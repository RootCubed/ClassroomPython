import * as db from "$lib/server/db";
import type { Load } from "@sveltejs/kit";

export const load: Load = async () => {
    return {
        users: await db.getUsers()
    };
};
