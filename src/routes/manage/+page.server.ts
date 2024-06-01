import * as db from "$lib/server/db";
import type { Load } from "@sveltejs/kit";

export const load: Load = async () => {
    try {
        return {
            users: await db.getUsers()
        };
    } catch (e) {
        console.error(e);
        return {
            users: null
        };
    }
};
