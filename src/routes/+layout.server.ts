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
                    {
                        title:
                            locals.user?.role != "STUDENT"
                                ? {}
                                : locals.isSEB
                                  ? { startsWith: "[PRÜFUNG]" }
                                  : { not: { startsWith: "[PRÜFUNG]" } }
                    }
                ]
            }
        })
    };
};
