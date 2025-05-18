import pdb from "$lib/server/prisma-db";
import { error, redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, locals, cookies }) => {
    if (!locals.user || locals.user.role != "ADMIN") {
        throw error(403, "Cannot login as another user");
    }

    const userId = url.searchParams.get("id");

    if (!userId) {
        throw error(400, "No user ID provided");
    }

    const session = await pdb.session.create({
        data: { userId }
    });

    cookies.set("session", session.id, { path: "/" });
    redirect(307, "/");
};
