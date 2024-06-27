import type { Actions } from "./$types.js";
import * as db from "$lib/server/db";
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
        const username = data.get("username");

        if (username === null || username === "") {
            return {
                success: false,
                username: {
                    value: "",
                    error: "No username provided!"
                }
            };
        }

        try {
            const sessionToken = await db.loginUser(username.toString());
            cookies.set("session", sessionToken, { path: "/" });
        } catch (error) {
            return {
                success: false,
                username: {
                    value: username.toString(),
                    error: "User does not exist!"
                }
            };
        }

        redirect(302, "/");
    }
};
