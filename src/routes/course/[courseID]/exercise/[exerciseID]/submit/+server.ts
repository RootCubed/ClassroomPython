import type { RequestHandler } from "./$types";
import * as db from "$lib/server/db";
import { error } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request, params }) => {
    if (!locals.user) {
        throw error(401);
    }
    try {
        const code = await request.text();
        await db.saveExercise(params.exerciseID, locals.user.id, code);
        await db.addSubmission(params.exerciseID, locals.user.id, code);
    } catch (e) {
        throw error(500, "The exercise could not be submitted.");
    }

    return new Response("OK", { status: 200 });
};
