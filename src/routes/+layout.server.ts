import * as db from "$lib/server/db";
import type { ServerLoad } from "@sveltejs/kit";

const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const load: ServerLoad = async ({ cookies }) => {
    const sessionToken = cookies.get("session");
    if (!sessionToken || !REGEX_UUID.test(sessionToken)) {
        return {
            user: null
        };
    }
    return {
        user: await db.checkSession(sessionToken)
    };
};
