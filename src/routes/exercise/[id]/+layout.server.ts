import * as db from "$lib/server/db";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ params, parent }) => {
    const exercise = await db.getExercise(params.id!);
    const { user } = await parent();
    if (user) {
        const savedCode = await db.getExerciseSave(params.id!, user.id);
        if (savedCode) {
            exercise.template = savedCode;
        }
    }
    return {
        exercise
    };
};
