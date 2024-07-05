<script lang="ts">
    import type { PageData } from "./course/$types";
    import UserMenu from "$lib/UserMenu.svelte";
    import * as Card from "$lib/components/ui/card";
    import { user } from "$lib/page-state";
    import { Role } from "@prisma/client";

    export let data: PageData;
</script>

<div class="flex h-full flex-col">
    <div class="flex content-around items-center p-2">
        <span class="text-lg">ClassroomPython</span>
        <UserMenu />
    </div>
    <div class="flex h-full items-center justify-center">
        <Card.Root class="mx-5 w-full max-w-lg">
            <Card.Header>
                <Card.Title class="text-2xl">Kursauswahl</Card.Title>
                <Card.Description>Wähle einer deiner Kurse aus, um fortzufahren.</Card.Description>
            </Card.Header>
            <Card.Content>
                <div class="max-h-96 overflow-y-auto">
                    {#if data.courses.length > 0}
                        {#each data.courses as course}
                            <a
                                href={`course/${course.id}`}
                                class="my-3 flex flex-col items-start gap-2 rounded-lg border p-3 text-sm transition-all hover:bg-accent"
                            >
                                <span class="text-lg font-semibold">{course.title}</span>
                                <span class="text-sm">{course.description}</span>
                            </a>
                        {/each}
                    {:else if $user.role === Role.STUDENT}
                        <span class="text-sm italic text-gray-500">
                            Du bist momentan in keinem Kurs eingeschrieben. Melde dich bei deiner
                            Lehrperson.
                        </span>
                    {:else}
                        <span class="text-sm italic text-gray-500">
                            Du hast noch keine Kurse erstellt. Erstelle einen neuen Kurs.
                        </span>
                    {/if}
                </div>
            </Card.Content>
        </Card.Root>
    </div>
</div>
