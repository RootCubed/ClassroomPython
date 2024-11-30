import type { RequestHandler } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { requestToken } from "$lib/oauth/oauth";
import pdb from "$lib/server/prisma-db";

export const GET: RequestHandler = async ({ request, cookies }) => {
    const url = new URL(request.url);

    const code = url.searchParams.get("code");

    if (!code) {
        return error(400, "Missing code");
    }

    const oauth = await requestToken(url.origin, code);

    if (!oauth) {
        return error(500, "Failed to get token");
    }

    const session = await pdb.session.create({
        data: {
            userId: oauth.userId
        }
    });

    cookies.set("session", session.id, { path: "/" });

    redirect(302, "/");
};
