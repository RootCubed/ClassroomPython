<script lang="ts">
    import type { PageData } from "./$types";
    import { Role } from "@prisma/client";

    import * as Card from "$lib/components/ui/card";
    import UserMenu from "$lib/UserMenu.svelte";
    import { user } from "$lib/page-state";

    import * as m from "$lib/paraglide/messages";

    let { data }: { data: PageData } = $props();
</script>

<div class="flex h-full flex-col">
    <div class="flex content-around items-center p-2">
        <span class="text-lg">{m.global_app_name()}</span>
        <UserMenu />
    </div>
    <div class="flex h-full items-center justify-center">
        <Card.Root class="mx-5 w-full max-w-lg">
            <Card.Header>
                <Card.Title class="text-2xl">{m.home_select_course()}</Card.Title>
                <Card.Description>{m.home_select_course_hint()}</Card.Description>
            </Card.Header>
            <Card.Content>
                <div class="max-h-96 overflow-y-auto">
                    {#if data.courses.length > 0}
                        {#each data.courses as course}
                            <a
                                href={`course/${course.id}`}
                                class="hover:bg-accent my-3 flex flex-col items-start gap-2 rounded-lg border p-3 text-sm transition-all"
                            >
                                <span class="text-lg font-semibold">{course.title}</span>
                                <span class="text-sm">{course.description}</span>
                            </a>
                        {/each}
                    {:else if $user.role === Role.STUDENT}
                        <span class="text-sm text-gray-500 italic">
                            {m.home_no_courses_student()}
                        </span>
                    {:else}
                        <span class="text-sm text-gray-500 italic">
                            {m.home_no_courses_teacher()}
                        </span>
                    {/if}
                </div>
            </Card.Content>
        </Card.Root>
    </div>
</div>
