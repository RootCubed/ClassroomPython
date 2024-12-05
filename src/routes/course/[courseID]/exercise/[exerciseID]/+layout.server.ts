import pdb from "$lib/server/prisma-db";
import { error, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ params, locals }) => {
    if (!locals.user) {
        throw error(401);
    }

    const exercise = await pdb.exercise.findUnique({
        where: {
            id: params.exerciseID
        },
        include: {
            saves: { where: { userId: locals.user.id } },
            submissions: { where: { userId: locals.user.id } },
            testcases: {
                orderBy: { orderNum: "asc" }
            },
            exerciseGroup: true
        }
    });

    if (!exercise) {
        throw error(404, "The exercise was not found.");
    }

    // Separate query because only only want have one result per testcase
    const testcaseResults = await pdb.testcaseResult.findMany({
        where: {
            testcase: {
                exerciseId: exercise.id
            }
        }
    });

    const res = {
        exercise: {
            ...exercise,
            testcases: exercise.testcases.map((tc) => ({
                ...tc,
                testcaseResult: testcaseResults.find((r) => r.testcaseId == tc.id) || null
            }))
        }
    };

    return res;
};
