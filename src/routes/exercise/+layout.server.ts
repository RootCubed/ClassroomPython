import * as db from "$lib/server/db";
import { error, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw error(401);
    }
    return {
        exercises: await db.getExercises(locals.user.id)
    };
};
