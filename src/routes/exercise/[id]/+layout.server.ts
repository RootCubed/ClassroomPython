import * as db from "$lib/server/db";
import { error, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ params, locals }) => {
    if (!locals.user) {
        throw error(401);
    }
    const exercise = await db.getExercise(params.id!, locals.user.id);
    if (!exercise) {
        throw error(404, "Die Aufgabe wurde nicht gefunden.");
    }
    return { exercise };
};
