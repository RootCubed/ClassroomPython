import * as db from "$lib/server/db";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ parent }) => {
    const { user } = await parent();
    return {
        exercises: await db.getExercises(user.id)
    };
};
