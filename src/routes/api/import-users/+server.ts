import type { RequestHandler } from "./$types";
import * as db from "$lib/server/db";
import { Role } from "@prisma/client";

export const POST: RequestHandler = async ({ request }) => {
    const users = (await request.json()) as {
        admins: { username: string; fullName: string }[];
        students: { username: string; fullName: string }[];
    };

    await db.resetUsers();

    for (const { username, fullName } of users.admins) {
        await db.createUser(username, fullName, Role.ADMIN);
    }

    for (const { username, fullName } of users.students) {
        await db.createUser(username, fullName, Role.STUDENT);
    }

    return new Response("OK", { status: 200 });
};
