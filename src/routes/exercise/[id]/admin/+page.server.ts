import * as db from "$lib/server/db";
import { error, type Load } from "@sveltejs/kit";

export const load: Load = async ({ params, parent }) => {
    const { user } = await parent();
    if (!user.isAdmin) {
        error(403, "Zugriff nicht erlaubt.");
    }
    const exercise = await db.adminGetExercise(params.id!);
    return {
        exercise
    };
};
