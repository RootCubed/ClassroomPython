import pdb from "$lib/server/prisma-db";
import { fail, type Actions, type ServerLoad } from "@sveltejs/kit";

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

export const actions: Actions = {
    default: async ({ request, locals }) => {
        const data = await request.formData();
        const name = data.get("name")?.toString();
        const description = data.get("description")?.toString() ?? "";

        if (!name) {
            return fail(400, { message: "No name provided!" });
        }

        if (!locals.user) {
            return fail(401, { message: "Not logged in!" });
        }

        await pdb.course.create({
            data: {
                title: name,
                description,
                owners: {
                    connect: { id: locals.user.id }
                }
            }
        });
    }
};
