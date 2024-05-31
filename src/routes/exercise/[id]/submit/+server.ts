import type { RequestHandler } from "./$types";
import * as db from "$lib/server/db";

export const POST: RequestHandler = async ({ request, params }) => {
    console.log(await db.getUsers());
    // TODO: check if exercise exists
    try {
        const code = await request.text();
        await db.addSubmission(
            params.id,
            "578dc6cc-18cc-431b-8e49-19808884f9d1", // TODO: get user id from session
            code
        );
    } catch (error) {
        console.error(error);
        return new Response("Internal Server Error", { status: 500 });
    }

    return new Response("OK", { status: 200 });
};
