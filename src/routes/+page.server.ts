import db from "$lib/server/db";

export const load = async () => {
    const res = await db.getPages();
    console.log(res);

    return {
        pages: res
    };
};
