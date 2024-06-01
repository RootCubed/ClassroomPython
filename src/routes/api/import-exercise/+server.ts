import type { RequestHandler } from "./$types";
import * as db from "$lib/server/db";

export const POST: RequestHandler = async ({ request }) => {
    const { meta, code } = (await request.json()) as {
        meta: { title: string; subtitle: string; groupName: string };
        code: string;
    };

    const groupID = await db.getExerciseGroup(meta.groupName, true);

    await db.createExercise(groupID, {
        title: meta.title,
        subtitle: meta.subtitle,
        template: code
    });

    return new Response("OK", { status: 200 });
};
