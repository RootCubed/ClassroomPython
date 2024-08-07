import pdb from "$lib/server/prisma-db";
import { error, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ locals, params }) => {
    if (!locals.user) {
        throw error(401);
    }

    return {
        exercises: await pdb.exerciseGroup.findMany({
            where: { courseId: params.courseID! },
            include: {
                exercises: {
                    include: {
                        saves: { where: { userId: locals.user.id } },
                        submissions: { where: { userId: locals.user.id } },
                        exerciseGroup: true
                    }
                }
            }
        })
    };
};
