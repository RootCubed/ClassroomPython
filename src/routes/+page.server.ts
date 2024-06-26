import { redirect, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ locals }) => {
    if (locals.user) return redirect(302, "/exercise");
    redirect(302, "/auth/login");
};
