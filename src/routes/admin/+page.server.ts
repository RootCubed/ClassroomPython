import db from "$lib/server/db";

export const load = async () => {
    const res = await db.setupDatabase();
    console.log(res);

    return res;
};
