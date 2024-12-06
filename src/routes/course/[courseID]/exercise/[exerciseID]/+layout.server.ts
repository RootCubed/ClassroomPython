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
                include: {
                    testcaseResults: { where: { userId: locals.user.id } }
                },
                orderBy: { orderNum: "asc" }
            },
            exerciseGroup: true
        }
    });

    if (!exercise) {
        throw error(404, "The exercise was not found.");
    }

    const res = {
        exercise: {
            id: exercise.id,
            title: exercise.title,
            subtitle: exercise.subtitle,
            description: exercise.description,
            codeTemplate: exercise.codeTemplate,
            exerciseGroup: exercise.exerciseGroup,
            submissions: exercise.submissions,
            save: exercise.saves.length > 0 ? exercise.saves[0] : null,
            testcases: exercise.testcases.map((tc) => ({
                id: tc.id,
                orderNum: tc.orderNum,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                testcaseResult: tc.testcaseResults.length > 0 ? tc.testcaseResults[0] : null
            }))
        }
    };

    return res;
};
