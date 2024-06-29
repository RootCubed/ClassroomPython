import * as db from "$lib/server/db";
import { Role } from "@prisma/client";
import { redirect, type Actions, type ServerLoad } from "@sveltejs/kit";
import { createUser } from "$lib/server/auth";

export const load: ServerLoad = async () => {
    if (await db.isInitialized()) {
        throw redirect(302, "/auth/login");
    }
};

export const actions: Actions = {
    default: async ({ request }) => {
        if (await db.isInitialized()) {
            throw redirect(302, "/auth/login");
        }

        const data = await request.formData();
        const fullName = data.get("fullname")?.toString();
        const username = data.get("username")?.toString();
        const password = data.get("password")?.toString();

        if (fullName === undefined || fullName === "") {
            return {
                success: false,
                fullName: {
                    value: "",
                    error: "No full name provided!"
                }
            };
        }

        if (username === undefined || username === "") {
            return {
                success: false,
                username: {
                    value: "",
                    error: "No username provided!"
                }
            };
        }

        if (password === undefined || password === "") {
            return {
                success: false,
                password: {
                    value: "",
                    error: "No password provided!"
                }
            };
        }

        await createUser(username, fullName, Role.ADMIN, password);

        redirect(302, "/");
    }
};
