import type { RequestHandler } from "./$types";
import * as db from "$lib/server/db";

export const GET: RequestHandler = async () => {
    await db.saveLastSubmissions();

    return new Response("OK", { status: 200 });
};
