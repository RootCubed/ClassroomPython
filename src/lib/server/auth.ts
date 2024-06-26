import type { RequestEvent } from "@sveltejs/kit";
import * as db from "$lib/server/db";
import type { User } from "@prisma/client";

export async function authUser(event: RequestEvent): Promise<User | null> {
    const sessionToken = event.cookies.get("session");
    if (!sessionToken) {
        return null;
    }
    const user = await db.checkSession(sessionToken);
    if (!user) {
        return null;
    }
    return user;
}
