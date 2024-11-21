import { getExercises } from "$lib/server/db";
import { error, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ locals, params }) => {
    if (!locals.user) {
        throw error(401);
    }

    return {
        exercises: await getExercises(params.courseID!, locals.user)
    };
};
