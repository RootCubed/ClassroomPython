import * as db from "$lib/server/db";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ params, parent }) => {
    const { user } = await parent();
    const exercise = await db.getExercise(params.id!, user.id);
    return {
        exercise
    };
};
