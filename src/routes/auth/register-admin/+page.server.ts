import * as db from "$lib/server/db";
import { Role } from "@prisma/client";
import { redirect, type Actions, type ServerLoad } from "@sveltejs/kit";
import argon2 from "argon2";

export const load: ServerLoad = async () => {
    if (await db.isInitialized()) {
        throw redirect(302, "/auth/login");
    }
};

export const actions: Actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const fullName = data.get("fullname")?.toString();
        const username = data.get("username")?.toString();
        const password = data.get("password")?.toString();

        if (fullName === undefined || fullName === "") {
            return {
                success: false,
                fullName: {
                    value: "",
                    error: "No full name provided!"
                }
            };
        }

        if (username === undefined || username === "") {
            return {
                success: false,
                username: {
                    value: "",
                    error: "No username provided!"
                }
            };
        }

        if (password === undefined || password === "") {
            return {
                success: false,
                password: {
                    value: "",
                    error: "No password provided!"
                }
            };
        }

        await db.default.user.create({
            data: {
                fullName: fullName,
                userName: username,
                role: Role.ADMIN,
                passwordHash: await argon2.hash(password)
            }
        });

        redirect(302, "/");
    }
};
