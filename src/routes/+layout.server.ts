import * as db from "$lib/server/db";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ params }) => {
    return {
        user: {
            id: "1",
            name: "student1",
            fullName: "Student 1",
            isAdmin: false
        }
    };
};
