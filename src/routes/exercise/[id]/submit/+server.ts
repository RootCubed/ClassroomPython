import type { RequestHandler } from "./$types";
import * as db from "$lib/server/db";

export const POST: RequestHandler = async ({ cookies, request, params }) => {
    const sessionToken = cookies.get("session");
    if (!sessionToken) {
        return new Response("Unauthorized", { status: 401 });
    }
    const user = await db.checkSession(sessionToken);
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }
    try {
        const code = await request.text();
        await db.addSubmission(params.id, user.id, code);
    } catch (error) {
        console.error(error);
        return new Response("Internal Server Error", { status: 500 });
    }

    return new Response("OK", { status: 200 });
};
