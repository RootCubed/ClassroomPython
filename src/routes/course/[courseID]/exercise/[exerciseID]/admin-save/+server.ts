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

    const testcases = code.testcases as {
        input: string;
        expectedOutput: string;
        orderNum: number;
    }[];

    await pdb.testcase.deleteMany({
        where: {
            exerciseId: params.exerciseID
        }
    });

    await pdb.testcase.createMany({
        data: testcases.map((tc) => ({
            exerciseId: params.exerciseID,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            orderNum: tc.orderNum
        }))
    });

    return new Response("OK", { status: 200 });
};
