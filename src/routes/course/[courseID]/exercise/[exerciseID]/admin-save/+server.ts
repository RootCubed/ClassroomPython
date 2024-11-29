import type { RequestHandler } from "./$types";
import pdb from "$lib/server/prisma-db";
import { error } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request, params }) => {
    if (!locals.user) {
        throw error(401);
    }

    const code = await request.json();
    await pdb.exercise.update({
        where: {
            id: params.exerciseID
        },
        data: {
            title: code.title ?? undefined,
            subtitle: code.subtitle ?? undefined,
            description: code.description ?? undefined,
            codeTemplate: code.codeTemplate ?? undefined
        }
    });

    return new Response("OK", { status: 200 });
};
