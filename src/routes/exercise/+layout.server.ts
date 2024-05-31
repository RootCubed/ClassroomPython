import * as db from "$lib/server/db";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ params }) => {
    let openExercise = null;
    if (params.id) {
        const exercise = await db.getExercise(params.id);
        openExercise = exercise;
    }
    return {
        exercises: await db.getExercises(),
        openExercise
    };
};
