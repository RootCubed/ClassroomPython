<script lang="ts">
    import type { PageData } from "./$types";

    import { enhance } from "$app/forms";

    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Plus } from "lucide-svelte";

    import ErrorableInput from "$lib/ErrorableInput.svelte";

    let { data }: { data: PageData } = $props();

    let createCourse = $state(false);
</script>

<Dialog.Root bind:open={createCourse}>
    <Dialog.Content class="flex flex-col">
        <Dialog.Header>
            <Dialog.Title>Kurs erstellen</Dialog.Title>
        </Dialog.Header>
        <div class="grid w-full items-center gap-1.5">
            <form method="POST" use:enhance>
                <div class="grid gap-4">
                    <ErrorableInput label="Kursname" id="name" type="text" serverResp={undefined} />
                    <ErrorableInput
                        label="Beschreibung"
                        id="description"
                        type="text"
                        serverResp={undefined}
                    />
                    <Button type="submit" class="w-full">Erstellen</Button>
                </div>
            </form>
        </div>
    </Dialog.Content>
</Dialog.Root>

<div class="h-full space-y-8 p-8">
    <div>
        <h2 class="text-2xl font-bold">Lehrer-Dashboard</h2>
        <p class="text-muted-foreground">Kursmanagement</p>
    </div>
    <div class="max-w-xl space-y-4">
        <h3 class="text-xl font-bold">Aktive Kurse</h3>

        {#each data.courses as course, i}
            <Card.Root class="hover:bg-accent cursor-pointer">
                <a href={`/teacher-admin/course/${course.id}`} class="contents">
                    <Card.Header>
                        <Card.Title>
                            {course.title}
                        </Card.Title>
                        <Card.Description>{course.description}</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <p class="text-muted-foreground">{course.students.length} Schüler</p>
                    </Card.Content>
                </a>
            </Card.Root>
        {/each}

        <Card.Root class="hover:bg-accent cursor-pointer">
            <div
                onclick={() => (createCourse = true)}
                onkeypress={() => (createCourse = true)}
                class="contents"
                aria-label="Neuen Kurs erstellen"
                role="button"
                tabindex={1}
            >
                <Card.Content class="flex items-center justify-center p-4">
                    <Plus />
                </Card.Content>
            </div>
        </Card.Root>
    </div>
</div>
