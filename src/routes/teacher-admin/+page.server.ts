import pdb from "$lib/server/prisma-db";
import type { ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ locals }) => {
    return {
        courses: await pdb.course.findMany({
            where: { owners: { some: { id: locals.user?.id } } },
            include: {
                students: true,
                owners: true
            }
        })
    };
};
