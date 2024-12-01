import type { RequestHandler } from "./$types";
import * as db from "$lib/server/db";
import pdb from "$lib/server/prisma-db";
import { error } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request, params }) => {
    if (!locals.user) {
        throw error(401);
    }
    try {
        const code = await request.text();
        await db.saveExercise(params.exerciseID, locals.user.id, code);
    } catch (e) {
        throw error(500, "The exercise could not be saved.");
    }

    return new Response("OK", { status: 200 });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
    if (!locals.user) {
        throw error(401);
    }
    try {
        await pdb.save.delete({
            where: {
                userId_exerciseId: {
                    userId: locals.user.id,
                    exerciseId: params.exerciseID
                }
            }
        });
    } catch (e) {
        throw error(500, "The exercise could not be deleted.");
    }

    return new Response("OK", { status: 200 });
};
