import type { RequestHandler } from "./$types";
import * as db from "$lib/server/db";

export const POST: RequestHandler = async () => {
    try {
        await db.resetAllExceptUsers();
    } catch (error) {
        console.error(error);
        return new Response("Internal Server Error", { status: 500 });
    }

    return new Response("OK", { status: 200 });
};
