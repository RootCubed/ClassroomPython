import pdb from "$lib/server/prisma-db";
import { error, type Load } from "@sveltejs/kit";

export const load: Load = async ({ params }) => {
    const exercise = await pdb.exercise.findUnique({
        where: {
            id: params.id
        },
        include: {
            submissions: { include: { user: true } }
        }
    });

    if (!exercise) {
        throw error(404, "Exercise not found");
    }

    return { exercise };
};
