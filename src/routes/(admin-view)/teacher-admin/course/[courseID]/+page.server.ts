import { getOrCreateMSUser } from "$lib/oauth/oauth";
import { getOAuthToken } from "$lib/server/auth";
import { getExercises } from "$lib/server/db";
import pdb from "$lib/server/prisma-db";
import { error, fail, redirect, type Actions, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ locals, params }) => {
    if (!locals.user) {
        throw error(401);
    }

    const course = await pdb.course.findUnique({
        where: { id: params.courseID! },
        include: {
            students: true
        }
    });
    const exercises = await getExercises(params.courseID!, locals.user);

    if (course == null) {
        throw error(404, "Course not found");
    }

    return { course, exercises };
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
    },
    updateCourse: async ({ request, params }) => {
        const data = await request.formData();
        const title = data.get("title")?.toString();
        const description = data.get("description")?.toString();
        const isExam = data.get("isExam");
        const isVisible = data.get("isVisible");

        if (title == null || description == null) {
            return fail(400, { message: "Invalid arguments" });
        }

        if (!params.courseID) {
            return fail(500, { message: "Course not found" });
        }

        await pdb.course.update({
            where: { id: params.courseID },
            data: {
                title,
                description,
                isExam: !!isExam,
                isVisible: !!isVisible
            }
        });
    },
    deleteCourse: async ({ params, locals }) => {
        if (locals.user?.role != "ADMIN") {
            return fail(403, { message: "Forbidden - must be admin to delete courses" });
        }

        if (!params.courseID) {
            return fail(500, { message: "Course not found" });
        }

        const deleteTransactions = [
            pdb.exercise.deleteMany({
                where: { exerciseGroup: { courseId: params.courseID } }
            }),
            pdb.exerciseGroup.deleteMany({
                where: { courseId: params.courseID }
            }),
            pdb.course.delete({
                where: { id: params.courseID }
            })
        ];

        await pdb.$transaction(deleteTransactions);

        return redirect(303, "/teacher-admin");
    }
};
