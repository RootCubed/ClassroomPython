import { error, redirect, type Handle } from "@sveltejs/kit";
import { authUser } from "$lib/server/auth";
import { Role } from "@prisma/client";

const adminOnlyRoutes = ["/exercise/[id]/admin/"];
const onlyLoggedInRoutes = ["/exercise/", "/api/"];

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
    } else if (isRouteMatch(event.route.id, onlyLoggedInRoutes) && !user) {
        throw redirect(303, "/auth/login");
    }

    event.locals.user = user;

    return await resolve(event);
};
