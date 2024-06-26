import * as db from "$lib/server/db";
import { error, type Load } from "@sveltejs/kit";

export const load: Load = async ({ params }) => {
    const exercise = await db.adminGetExercise(params.id!);

    if (!exercise) {
        throw error(404, "Exercise not found");
    }

    return { exercise };
};
