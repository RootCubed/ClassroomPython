import pdb from "$lib/server/prisma-db";
import type { Load } from "@sveltejs/kit";

export const load: Load = async () => {
    try {
        return {
            users: await pdb.user.findMany()
        };
    } catch (e) {
        console.error(e);
        return {
            users: null
        };
    }
};
