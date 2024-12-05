import pdb from "$lib/server/prisma-db";
import { error, redirect, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
    if (!locals.user || locals.user.role != "ADMIN") {
        throw error(403, "Cannot login as another user");
    }

    const data = await request.formData();
    const userId = data.get("userId")?.toString();

    if (!userId) {
        throw error(400, "No user ID provided");
    }

    const session = await pdb.session.create({
        data: { userId }
    });

    cookies.set("session", session.id, { path: "/" });
    redirect(302, "/");
};
