import pdb from "$lib/server/prisma-db";
import { createUser } from "$lib/server/auth";
import { Role } from "@prisma/client";
import { fail, type ActionFailure, type Actions, type Load } from "@sveltejs/kit";

export const load: Load = async () => {
    try {
        return {
            users: await pdb.user.findMany()
        };
    } catch (e) {
        console.error(e);
        return {
            users: null
        };
    }
};

export const actions: Actions = {
    deleteUser: async ({ request, locals }) => {
        const data = await request.formData();
        const id = data.get("userId")?.toString();

        if (id === undefined) {
            return fail(400, { message: "No user ID provided" });
        }

        // Cannot delete own user or ADMIN
        const user = await pdb.user.findUnique({
            where: { id }
        });
        if (user === null || user.id === locals.user?.id || user.role === Role.ADMIN) {
            return fail(400, { message: "Cannot delete this user" });
        }

        await pdb.user.delete({
            where: { id }
        });
    },
    createUser: async ({ request }) => {
        const data = await request.formData();
        const fullName = data.get("fullname")?.toString();
        const username = data.get("username")?.toString();

        if (fullName === undefined || fullName === "") {
            return fail(400, {
                fullName: {
                    value: "",
                    error: "No full name provided!"
                }
            });
        }

        if (username === undefined || username === "") {
            return fail(400, {
                username: {
                    value: "",
                    error: "No username provided!"
                }
            });
        }

        await createUser(username, fullName, Role.STUDENT, username);
    }
};
