import { error, redirect, type Handle, type HandleServerError } from "@sveltejs/kit";
import { authUser } from "$lib/server/auth";
import { Role } from "@prisma/client";
import { Prisma } from "@prisma/client";

const adminOnlyRoutes = ["/exercise/[id]/admin/", "/manage"];
const nonLoggedInAllowedRoutes = ["/auth/"];

function isRouteMatch(route: string | null, filter: string[]) {
    if (!route) {
        return false;
    }
    return filter.some((r) => (route + "/").startsWith(r));
}

export const handle: Handle = async ({ event, resolve }) => {
    const user = await authUser(event);

    if (isRouteMatch(event.route.id, adminOnlyRoutes) && user?.role !== Role.ADMIN) {
        throw error(403, "Forbidden");
    } else if (!user && !isRouteMatch(event.route.id, nonLoggedInAllowedRoutes)) {
        throw redirect(303, "/auth/login");
    }

    event.locals.user = user;

    return await resolve(event);
};

const knownErrorTypes = [
    {
        errorClasses: [Prisma.PrismaClientInitializationError],
        message: "A database connection error occurred. Please try again later."
    },
    {
        errorClasses: [
            Prisma.PrismaClientKnownRequestError,
            Prisma.PrismaClientUnknownRequestError,
            Prisma.PrismaClientValidationError
        ],
        message: "A database error occurred. Please try again later."
    }
];

export const handleError: HandleServerError = async ({ error, status }) => {
    if (status === 404) {
        return { message: "Page not found." };
    }
    console.error(error);
    for (const { errorClasses, message } of knownErrorTypes) {
        for (const errorClass of errorClasses) {
            if (error instanceof errorClass) {
                return { message };
            }
        }
    }
    return { message: "An unknown error occurred." };
};
