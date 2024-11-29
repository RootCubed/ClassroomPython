import type { RequestHandler } from "./$types";
import pdb from "$lib/server/prisma-db";
import { error } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request, params }) => {
    if (!locals.user) {
        throw error(401);
    }

    const data = await request.json();
    await pdb.testcase.create({
        data: {
            ...data,
            id: undefined,
            testcaseResults: undefined,
            exerciseId: params.exerciseID
        }
    });

    return new Response("OK", { status: 200 });
};
