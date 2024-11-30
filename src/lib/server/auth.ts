import type { RequestEvent } from "@sveltejs/kit";
import argon2 from "argon2";
import db from "$lib/server/prisma-db";
import type { User, Role } from "@prisma/client";

export type ClientUser = Omit<User, "passwordHash">;

export async function createUser(
    userName: string,
    fullName: string,
    role: Role,
    password: string
): Promise<string> {
    const user = await db.user.create({
        data: {
            userName,
            fullName,
            role,
            passwordHash: await argon2.hash(password)
        }
    });
    return user.id;
}

export async function loginUser(userName: string, password: string): Promise<string> {
    const user = await db.user.findUnique({
        where: { userName },
        omit: { passwordHash: false }
    });
    if (!user) {
        throw new Error("User does not exist");
    }
    if (!user.passwordHash) {
        throw new Error("Local auth disallowed. Login with Microsoft instead.");
    }
    if (!(await argon2.verify(user.passwordHash, password))) {
        throw new Error("Wrong password!");
    }
    const session = await db.session.create({
        data: {
            userId: user.id
        }
    });
    return session.id;
}

export async function authUser(event: RequestEvent): Promise<ClientUser | null> {
    const sessionToken = event.cookies.get("session");
    if (!sessionToken) {
        return null;
    }
    return await checkSession(sessionToken);
}

export async function checkSession(sessionToken: string): Promise<ClientUser | null> {
    const session = await db.session.findUnique({
        where: { id: sessionToken },
        include: { user: true }
    });
    if (!session) {
        return null;
    }
    return session.user;
}

export async function invalidateSession(sessionToken: string): Promise<void> {
    await db.session.delete({
        where: { id: sessionToken }
    });
}
