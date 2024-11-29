import type { RequestHandler } from "./$types";
import pdb from "$lib/server/prisma-db";
import { error } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ locals, request, params }) => {
    if (!locals.user) {
        throw error(401);
    }

    await pdb.testcase.delete({
        where: { id: params.testcaseID }
    });

    return new Response("OK", { status: 200 });
};

export const PATCH: RequestHandler = async ({ locals, request, params }) => {
    if (!locals.user) {
        throw error(401);
    }

    const data = await request.json();
    await pdb.testcase.update({
        where: {
            id: params.testcaseID
        },
        data: {
            ...data,
            id: undefined,
            testcaseResults: undefined,
            exerciseId: params.exerciseID
        }
    });

    return new Response("OK", { status: 200 });
};
