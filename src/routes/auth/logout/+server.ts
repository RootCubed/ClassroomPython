import type { RequestHandler } from "./$types";
import * as db from "$lib/server/db";
import { redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
    const sessionToken = cookies.get("session");
    if (sessionToken) {
        await db.invalidateSession(sessionToken);
        cookies.delete("session", { path: "/" });
    }

    redirect(302, "/auth/login");
};
