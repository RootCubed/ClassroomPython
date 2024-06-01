import type { Actions } from "./$types.js";
import * as db from "$lib/server/db";
import { redirect } from "@sveltejs/kit";

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
