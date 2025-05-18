<script lang="ts">
    import type { PageData } from "./$types";

    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import type { ExerciseGroup } from "@prisma/client";

    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Label } from "$lib/components/ui/label";
    import { Plus, Trash } from "@lucide/svelte";
    import AceEditor from "$lib/AceEditor.svelte";
    import ErrorableInput from "$lib/ErrorableInput.svelte";

    let { data }: { data: PageData } = $props();

    let code = $state("");
    let createExercise = $state(false);

    let groupSelect = $state("");

    function onCodeUpdate(newCode: string) {
        code = newCode;
    }

    let availExerciseGroups = data.exercises.reduce((acc, exercise) => {
        if (!acc.find((g) => g.id === exercise.id)) {
            acc.push(exercise);
        }
        return acc;
    }, [] as ExerciseGroup[]);
</script>

<Dialog.Root bind:open={createExercise}>
    <Dialog.Content class="flex max-w-2xl flex-col">
        <Dialog.Header>
            <Dialog.Title>Aufgabe erstellen</Dialog.Title>
        </Dialog.Header>
        <div class="grid w-full items-center gap-1.5">
            <form method="POST" action="?/createExercise" use:enhance>
                <div class="grid gap-4">
                    <ErrorableInput label="Titel" id="title" type="text" serverResp={undefined} />
                    <select
                        id="group"
                        name="group"
                        class="w-full rounded-md border border-gray-300 p-2"
                        bind:value={groupSelect}
                    >
                        {#each availExerciseGroups as group}
                            <option value={group.id}>{group.title}</option>
                        {/each}
                        <option value="">(Neuer Ordner)</option>
                    </select>
                    {#if groupSelect == ""}
                        <ErrorableInput
                            label="Ordnername"
                            id="newGroupName"
                            type="text"
                            placeholder="Neuer Ordner"
                            serverResp={undefined}
                        />
                    {/if}
                    <Label for="code">Code-Vorlage</Label>
                    <div class="h-80">
                        <AceEditor initialValue="" onUpdate={onCodeUpdate} />
                    </div>
                    <input type="hidden" id="code" name="code" value={code} />
                    <Button type="submit" class="w-full">Erstellen</Button>
                </div>
            </form>
        </div>
    </Dialog.Content>
</Dialog.Root>

<div class="h-full max-w-xl space-y-8 p-8">
    <h2 class="text-2xl font-bold">Kursmanagement {data.course.title}</h2>
    <form
        method="POST"
        action="?/updateCourse"
        use:enhance={() => {
            return async ({ update }) => {
                update({ reset: false });
            };
        }}
    >
        <div class="grid gap-4">
            <ErrorableInput
                label="Titel"
                id="title"
                type="text"
                value={data.course.title}
                serverResp={undefined}
            />
            <ErrorableInput
                label="Beschreibung"
                id="description"
                type="text"
                value={data.course.description}
                serverResp={undefined}
            />
            <div class="flex gap-2">
                <Label for="isExam">Prüfung</Label>
                <input type="checkbox" id="isExam" name="isExam" checked={data.course.isExam} />
            </div>
            <div class="flex gap-2">
                <Label for="isVisible">Sichtbar für Schüler:innen</Label>
                <input
                    type="checkbox"
                    id="isVisible"
                    name="isVisible"
                    checked={data.course.isVisible}
                />
            </div>
            <Button type="submit">Speichern</Button>
        </div>
    </form>
    <div class="space-y-4">
        <h3 class="text-xl font-bold">Schüler</h3>
        <div class="grid gap-2">
            {#each data.course.students as s}
                <span>- {s.fullName}</span>
            {/each}
            <form
                method="POST"
                action="?/addStudent"
                use:enhance
                onsubmit={invalidateAll}
                class="flex flex-row gap-2"
            >
                <ErrorableInput
                    label="Schüler hinzufügen"
                    id="studentUsername"
                    type="text"
                    serverResp={undefined}
                />
                <button type="submit">
                    <Plus />
                </button>
            </form>
        </div>
    </div>
    <div class="space-y-4">
        <h3 class="text-xl font-bold">Editor</h3>

        {#each data.exercises as group}
            <h4>{group.title}</h4>
            <div class="grid gap-2">
                {#each group.exercises as exercise}
                    <div class="flex items-center justify-between border-b p-2">
                        <div>
                            <h2 class="text-lg font-semibold">{exercise.title}</h2>
                            <p class="text-muted-foreground text-sm">{exercise.subtitle}</p>
                        </div>
                        <div class="flex gap-2">
                            <form
                                method="POST"
                                action="?/deleteExercise"
                                use:enhance
                                onsubmit={invalidateAll}
                                class="flex flex-row gap-2"
                            >
                                <input type="hidden" name="exerciseID" value={exercise.id} />
                                <Button variant="destructive" class="h-8 w-8 p-0" type="submit">
                                    <Trash />
                                </Button>
                            </form>
                        </div>
                    </div>
                {/each}
            </div>
        {/each}

        <Card.Root class="hover:bg-accent cursor-pointer">
            <div
                onclick={() => (createExercise = true)}
                onkeypress={() => (createExercise = true)}
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
    <div class="space-y-4">
        <h3 class="text-xl font-bold">Kurs löschen</h3>

        <form
            method="POST"
            action="?/deleteCourse"
            use:enhance
            onsubmit={invalidateAll}
            class="flex flex-row gap-2"
        >
            <Button type="submit" variant="destructive">Kurs löschen</Button>
        </form>
    </div>
</div>
