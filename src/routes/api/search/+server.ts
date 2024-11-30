import type { RequestHandler } from "./$types";
import { getOAuthToken as getOAuth } from "$lib/server/auth";
import { error, json } from "@sveltejs/kit";
import { graphRequest } from "$lib/oauth/oauth";

export const GET: RequestHandler = async ({ locals, url }) => {
    if (!locals.user) {
        throw error(401);
    }

    const oauth = await getOAuth(locals.user.id);

    if (!oauth) {
        throw error(401, "Missing token");
    }

    let endpoint = "https://graph.microsoft.com/v1.0/users";

    if (url.searchParams.has("q")) {
        endpoint += `?$filter=startswith(mail,'${url.searchParams.get("q")}')`;
    }

    return json(await graphRequest(oauth, endpoint));
};
