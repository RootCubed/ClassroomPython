import * as db from "$lib/server/db";
import { loginUser } from "$lib/server/auth";
import { fail, redirect, type Actions, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async () => {
    if (!(await db.isInitialized())) {
        throw redirect(302, "/auth/register-admin");
    }

    return {};
};

export const actions: Actions = {
    default: async ({ cookies, request }) => {
        const data = await request.formData();
        const username = data.get("username")?.toString();
        const password = data.get("password")?.toString();

        if (username == undefined || username === "") {
            return fail(400, {
                username: {
                    value: "",
                    error: "No username provided!"
                }
            });
        }

        if (password == undefined || password === "") {
            return fail(400, {
                password: {
                    value: "",
                    error: "No password provided!"
                }
            });
        }

        try {
            const sessionToken = await loginUser(username, password);
            cookies.set("session", sessionToken, { path: "/" });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message == "User does not exist") {
                    return fail(400, {
                        username: {
                            value: username,
                            error: "User does not exist!"
                        }
                    });
                } else if (error.message == "Wrong password!") {
                    return fail(400, {
                        username: {
                            value: username
                        },
                        password: {
                            value: password,
                            error: "Wrong password!"
                        }
                    });
                }
            }
        }

        redirect(302, "/");
    }
};
