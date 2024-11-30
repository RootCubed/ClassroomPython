import { getOrCreateMSUser } from "$lib/oauth/oauth";
import { getOAuthToken } from "$lib/server/auth";
import { getExercises } from "$lib/server/db";
import pdb from "$lib/server/prisma-db";
import { error, fail, type Actions, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ locals, params }) => {
    if (!locals.user) {
        throw error(401);
    }

    return {
        course: await pdb.course.findUnique({
            where: { id: params.courseID! },
            include: {
                students: true
            }
        }),
        exercises: await getExercises(params.courseID!, locals.user)
    };
};

export const actions: Actions = {
    createExercise: async ({ request, params }) => {
        const data = await request.formData();
        const title = data.get("title")?.toString();
        const code = data.get("code")?.toString() ?? "";
        let group = data.get("group")?.toString();

        if (!group) {
            const newGroupName = data.get("newGroupName")?.toString();
            if (!newGroupName) {
                return fail(400, { message: "Invalid arguments" });
            }
            group = newGroupName;
        }

        if (!title) {
            return fail(400, { message: "Invalid arguments" });
        }

        if (!params.courseID) {
            return fail(500, { message: "Course not found" });
        }

        await pdb.exercise.create({
            data: {
                title,
                codeTemplate: code,
                isInLibrary: false,
                exerciseGroup: {
                    connectOrCreate: {
                        where: { id: group },
                        create: {
                            title: group,
                            courseId: params.courseID
                        }
                    }
                }
            }
        });
    },
    addStudent: async ({ request, params, locals }) => {
        const data = await request.formData();
        const username = data.get("studentUsername")?.toString();

        if (!locals.user) {
            return fail(401);
        }

        const oauth = await getOAuthToken(locals.user.id);

        if (!oauth) {
            return fail(401, { message: "Missing token" });
        }

        if (!username) {
            return fail(400, { message: "Invalid arguments" });
        }

        if (!params.courseID) {
            return fail(500, { message: "Course not found" });
        }

        const user = await getOrCreateMSUser(oauth, username);

        await pdb.course.update({
            where: { id: params.courseID },
            data: {
                students: {
                    connect: {
                        id: user.id
                    }
                }
            }
        });
    }
};
