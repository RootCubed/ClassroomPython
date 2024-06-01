import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types.js";
import * as db from "$lib/server/db";

export const actions: Actions = {
    default: async ({ cookies, request }) => {
        const data = await request.formData();
        const username = data.get("username");

        if (username === null) {
            return { success: false, error: "No username provided" };
        }

        const sessionToken = await db.loginUser(username.toString());

        cookies.set("session", sessionToken, { path: "/" });

        redirect(303, "/exercise");

        return { success: true };
    }
};
