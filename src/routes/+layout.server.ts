import pdb from "$lib/server/prisma-db";
import type { ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ locals }) => {
    return {
        user: locals.user,
        courses: await pdb.course.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { students: { some: { id: locals.user?.id } } },
                            { owners: { some: { id: locals.user?.id } } }
                        ]
                    },
                    locals.user?.role == "STUDENT"
                        ? {
                              AND: [{ isVisible: true }, { isExam: locals.isSEB }]
                          }
                        : {}
                ]
            }
        })
    };
};
