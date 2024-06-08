import * as db from "$lib/server/db";
import { error, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ params, locals }) => {
    if (!locals.user) {
        throw error(401);
    }
    try {
        return {
            exercise: await db.getExercise(params.id!, locals.user.id)
        };
    } catch (e) {
        throw error(404, "Die Aufgabe wurde nicht gefunden.");
    }
};
