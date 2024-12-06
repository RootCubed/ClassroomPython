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
            submissions: {
                include: {
                    user: true,
                    exercise: {
                        include: {
                            testcases: true
                        }
                    }
                },
                orderBy: { timestamp: "desc" }
            },
            testcases: {
                orderBy: { orderNum: "asc" }
            }
        }
    });

    if (!exercise) {
        throw error(404, "Exercise not found");
    }

    const testcaseResults = (
        await pdb.testcaseResult.findMany({
            where: {
                testcase: {
                    exerciseId: exercise.id
                }
            }
        })
    ).map((r) => ({ ...r, used: false }));

    return {
        exercise: {
            ...exercise,
            submissions: exercise.submissions.map((s) => ({
                ...s,
                results: testcaseResults
                    .filter((r) => !r.used && r.userId == s.userId)
                    .map((r) => {
                        r.used = true;
                        return r;
                    })
            })),
            testcases: exercise.testcases.map((t) => ({
                ...t,
                testcaseResult: null
            }))
        }
    };
};
