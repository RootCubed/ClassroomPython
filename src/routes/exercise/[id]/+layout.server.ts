import * as db from "$lib/server/db";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ params }) => {
    const exercise = await db.getExercise(params.id!);
    return {
        exercise
    };
};
