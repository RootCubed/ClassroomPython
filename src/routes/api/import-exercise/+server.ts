import type { RequestHandler } from "./$types";
import * as db from "$lib/server/db";
import pdb from "$lib/server/prisma-db";

export const POST: RequestHandler = async ({ request }) => {
    const { meta, code } = (await request.json()) as {
        meta: { title: string; subtitle: string; groupName: string };
        code: string;
    };

    let group = await pdb.exerciseGroup.findFirst({
        where: {
            title: meta.groupName
        }
    });

    if (!group) {
        group = await db.createExerciseGroup(
            // Courses not supported yet, hardcoding for now
            "af0471c8-bcea-4771-8abe-37d3b5173191",
            meta.groupName
        );
    }

    await db.createExercise(group.id, meta.title, meta.subtitle, "", code);

    return new Response("OK", { status: 200 });
};
