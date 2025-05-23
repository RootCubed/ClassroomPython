import pdb from "$lib/server/prisma-db";
import { createUser } from "$lib/server/auth";
import { Role } from "@prisma/client";
import { fail, type ActionFailure, type Actions, type Load } from "@sveltejs/kit";

export const load: Load = async () => {
    return {
        users: await pdb.user.findMany({
            orderBy: {
                fullName: "asc"
            }
        })
    };
};

export const actions: Actions = {
    deleteUser: async ({ request, locals }) => {
        const data = await request.formData();
        const id = data.get("id")?.toString();

        if (id == undefined) {
            return fail(400, { message: "No user ID provided" });
        }

        // Cannot delete own user or ADMIN
        const user = await pdb.user.findUnique({
            where: { id },
            include: {
                oauth: true
            }
        });
        if (user == null || user.id == locals.user?.id) {
            return fail(400, { message: "Cannot delete this user" });
        }

        await pdb.user.update({
            where: { id },
            data: {
                oauth: { delete: user.oauth != null },
                sessions: { deleteMany: {} },
                saves: { deleteMany: {} },
                testcaseResults: { deleteMany: {} }
            }
        });

        await pdb.user.delete({
            where: { id }
        });
    },
    createUser: async ({ request }) => {
        const data = await request.formData();
        const fullName = data.get("fullname")?.toString();
        const username = data.get("username")?.toString();
        const role = data.get("role")?.toString();

        if (!role) {
            return fail(400, {
                role: {
                    value: role,
                    error: "No role provided!"
                }
            });
        }
        const roleValue = {
            ADMIN: Role.ADMIN,
            TEACHER: Role.TEACHER,
            STUDENT: Role.STUDENT
        }[role];

        if (roleValue == undefined) {
            return fail(400, {
                role: {
                    value: role,
                    error: "Invalid role provided!"
                }
            });
        }

        if (fullName == undefined || fullName == "") {
            return fail(400, {
                fullName: {
                    value: "",
                    error: "No full name provided!"
                }
            });
        }

        if (username == undefined || username == "") {
            return fail(400, {
                username: {
                    value: "",
                    error: "No username provided!"
                }
            });
        }

        await createUser(username, fullName, roleValue, username);
    },
    changeRole: async ({ locals, request }) => {
        const data = await request.formData();
        const id = data.get("id")?.toString();
        const role = data.get("role")?.toString();
        if (id == undefined) {
            return fail(400, { message: "No user ID provided" });
        }
        if (locals.user?.id == id) {
            return fail(400, { message: "Cannot change own role" });
        }

        const roleValue: Record<string, Role> = {
            ADMIN: Role.ADMIN,
            TEACHER: Role.TEACHER,
            STUDENT: Role.STUDENT
        };

        if (role == undefined || !roleValue[role]) {
            return fail(400, { message: "Invalid role" });
        }

        await pdb.user.update({
            where: { id },
            data: { role: roleValue[role] }
        });
    }
};
