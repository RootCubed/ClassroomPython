import type { RequestHandler } from "./$types";
import { invalidateSession } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
    const sessionToken = cookies.get("session");
    if (sessionToken) {
        await invalidateSession(sessionToken);
        cookies.delete("session", { path: "/" });
    }

    redirect(302, "/auth/login");
};
