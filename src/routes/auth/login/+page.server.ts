import type { Actions } from "./$types";
import * as db from "$lib/server/db";
import { loginUser } from "$lib/server/auth.js";
import { redirect, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async () => {
    if (!(await db.isInitialized())) {
        throw redirect(302, "/auth/register-admin");
    }

    return {};
};

export const actions: Actions = {
    default: async ({ cookies, request }) => {
        const data = await request.formData();
        const username = data.get("username")?.toString();
        const password = data.get("password")?.toString();

        if (username === undefined || username === "") {
            return {
                success: false,
                username: {
                    value: "",
                    error: "No username provided!"
                }
            };
        }

        if (password === undefined) {
            return {
                success: false,
                password: {
                    value: "",
                    error: "No password provided!"
                }
            };
        }

        try {
            const sessionToken = await loginUser(username, password);
            cookies.set("session", sessionToken, { path: "/" });
        } catch (error) {
            return {
                success: false,
                username: {
                    value: username,
                    error: "User does not exist!"
                }
            };
        }

        redirect(302, "/");
    }
};
