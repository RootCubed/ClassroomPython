<script lang="ts">
    import type { PageData } from "./$types";
    import * as Card from "$lib/components/ui/card";
    import * as Dialog from "$lib/components/ui/dialog";
    import { enhance } from "$app/forms";
    import ErrorableInput from "$lib/ErrorableInput.svelte";
    import { Button } from "$lib/components/ui/button";
    import { Plus } from "lucide-svelte";

    import AceEditor from "$lib/AceEditor.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import type { ExerciseGroup } from "@prisma/client";

    export let data: PageData;

    let code = "";
    let createExercise = false;
    let editor: AceEditor | undefined;

    let availExerciseGroups = data.exercises.reduce((acc, exercise) => {
        if (!acc.find((g) => g.id === exercise.id)) {
            acc.push(exercise);
        }
        return acc;
    }, [] as ExerciseGroup[]);
</script>

<Dialog.Root bind:open={createExercise}>
    <Dialog.Content class="flex flex-col">
        <Dialog.Header>
            <Dialog.Title>Aufgabe erstellen</Dialog.Title>
        </Dialog.Header>
        <div class="grid w-full items-center gap-1.5">
            <form method="POST" use:enhance>
                <div class="grid gap-4">
                    <ErrorableInput label="Titel" id="title" type="text" serverResp={undefined} />
                    <select
                        id="group"
                        name="group"
                        class="w-full rounded-md border border-gray-300 p-2"
                    >
                        {#each availExerciseGroups as group}
                            <option value={group.id}>{group.title}</option>
                        {/each}
                        <option value="new">Neuer Ordner</option>
                    </select>
                    <Label for="code">Code-Vorlage</Label>
                    <div class="h-80">
                        <AceEditor bind:value={code} bind:this={editor} />
                    </div>
                    <input type="hidden" id="code" name="code" value={code} />
                    <Button type="submit" class="w-full">Erstellen</Button>
                </div>
            </form>
        </div>
    </Dialog.Content>
</Dialog.Root>

<div class="h-full space-y-8 p-8">
    <h2 class="text-2xl font-bold">Kursmanagement {data.course?.title}</h2>
    <div class="max-w-xl space-y-4">
        <h3 class="text-xl font-bold">Editor</h3>

        {#each data.exercises as group}
            <h4>{group.title}</h4>
            <div class="grid gap-2">
                {#each group.exercises as exercise}
                    <Card.Root class="cursor-pointer hover:bg-accent">
                        <Card.Header>
                            <Card.Title>{exercise.title}</Card.Title>
                            <Card.Description>{exercise.description}</Card.Description>
                        </Card.Header>
                        <Card.Content>
                            <p>...</p>
                        </Card.Content>
                    </Card.Root>
                {/each}
            </div>
        {/each}

        <Card.Root class="cursor-pointer hover:bg-accent">
            <div
                on:click={() => (createExercise = true)}
                on:keypress={() => (createExercise = true)}
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
