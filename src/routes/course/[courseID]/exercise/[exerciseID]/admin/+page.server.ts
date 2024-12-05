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
                }
            },
            testcases: {
                include: {
                    testcaseResults: {
                        where: { userId: locals.user.id }
                    }
                },
                orderBy: { orderNum: "asc" }
            }
        }
    });

    if (!exercise) {
        throw error(404, "Exercise not found");
    }

    return { exercise };
};
