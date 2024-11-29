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
                    testcaseResults: {
                        where: {
                            userId: locals.user.id
                        }
                    }
                }
            },
            exerciseGroup: true
        }
    });

    if (!exercise) {
        throw error(404, "Die Aufgabe wurde nicht gefunden.");
    }

    return { exercise };
};
