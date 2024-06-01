import type { RequestHandler } from "./$types";
import * as db from "$lib/server/db";

export const POST: RequestHandler = async ({ request }) => {
    const users = (await request.json()) as {
        admins: { username: string; fullName: string }[];
        students: { username: string; fullName: string }[];
    };

    await db.deleteAllUsers();

    for (const { username, fullName } of users.admins) {
        await db.createUser(username, fullName, "teacher");
    }

    for (const { username, fullName } of users.students) {
        await db.createUser(username, fullName, "student");
    }

    return new Response("OK", { status: 200 });
};
