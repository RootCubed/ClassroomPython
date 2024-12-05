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
        const submitAs = json.submitAs;
        if (submitAs && locals.user.role == "STUDENT") {
            throw error(403, "You are not allowed to submit as another user.");
        }
        if (!submitAs) {
            await db.saveExercise(params.exerciseID, locals.user.id, code);
            await db.addSubmission(params.exerciseID, locals.user.id, code);
        }
        const userID = submitAs || locals.user.id;
        for (const tc of testcaseResults) {
            await pdb.testcaseResult.upsert({
                where: {
                    testcaseId_userId: {
                        userId: userID,
                        testcaseId: tc.id
                    }
                },
                create: {
                    userId: userID,
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
