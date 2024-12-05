import type { RequestHandler } from "./$types";
import * as db from "$lib/server/db";
import pdb from "$lib/server/prisma-db";
import { error } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request, params }) => {
    if (!locals.user) {
        throw error(401);
    }
    try {
        const json = await request.json();
        const code = json.code;
        if (!code) {
            throw error(400, "The code is missing.");
        }
        const testcaseResults = json.testcaseResults;
        if (!testcaseResults) {
            throw error(400, "The testcase results are missing.");
        }
        await db.saveExercise(params.exerciseID, locals.user.id, code);
        await db.addSubmission(params.exerciseID, locals.user.id, code);
        for (const tc of testcaseResults) {
            await pdb.testcaseResult.upsert({
                where: {
                    testcaseId_userId: {
                        userId: locals.user.id,
                        testcaseId: tc.id
                    }
                },
                create: {
                    userId: locals.user.id,
                    testcaseId: tc.id,
                    passed: tc.passed
                },
                update: {
                    passed: tc.passed
                }
            });
        }
    } catch (e) {
        throw error(500, "The exercise could not be submitted.");
    }

    return new Response("OK", { status: 200 });
};
