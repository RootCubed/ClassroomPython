<script lang="ts">
    import type { ActionData, PageData } from "./$types";

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
    import * as Tabs from "$lib/components/ui/tabs";
    import DataTable from "$lib/components/dataviews/DataTable.svelte";
    import { columns } from "./user-columns";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import { m } from "$lib/paraglide/messages";

    let { data, form }: { data: PageData; form: ActionData } = $props();

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
            <Dialog.Title>{m.teacher_admin_cm_create_exercise()}</Dialog.Title>
        </Dialog.Header>
        <div class="grid w-full items-center gap-1.5">
            <form method="POST" action="?/createExercise" use:enhance>
                <div class="grid gap-4">
                    <ErrorableInput
                        label={m.global_title()}
                        id="title"
                        type="text"
                        serverResp={undefined}
                    />
                    <select
                        id="group"
                        name="group"
                        class="w-full rounded-md border border-gray-300 p-2"
                        bind:value={groupSelect}
                    >
                        {#each availExerciseGroups as group}
                            <option value={group.id}>{group.title}</option>
                        {/each}
                        <option value="">{m.teacher_admin_new_folder()}</option>
                    </select>
                    {#if groupSelect == ""}
                        <ErrorableInput
                            label={m.exercises_folder_name()}
                            id="newGroupName"
                            type="text"
                            placeholder="Neuer Ordner"
                            serverResp={undefined}
                        />
                    {/if}
                    <Label for="code">{m.exercises_code_template()}</Label>
                    <div class="h-80">
                        <AceEditor initialValue="" onUpdate={onCodeUpdate} />
                    </div>
                    <input type="hidden" id="code" name="code" value={code} />
                    <Button type="submit" class="w-full">{m.global_create()}</Button>
                </div>
            </form>
        </div>
    </Dialog.Content>
</Dialog.Root>

<div class="h-full max-w-3xl space-y-8 p-8">
    <h2 class="text-2xl font-bold">
        {m.teacher_admin_course_management({ title: data.course.title })}
    </h2>
    <Tabs.Root value="general" class="w-full">
        <Tabs.List class="w-full">
            <Tabs.Trigger value="general" class="w-full"
                >{m.teacher_admin_cm_tab_general()}</Tabs.Trigger
            >
            <Tabs.Trigger value="participants" class="w-full"
                >{m.teacher_admin_cm_tab_participants()}</Tabs.Trigger
            >
            <Tabs.Trigger value="exercises" class="w-full"
                >{m.teacher_admin_cm_tab_exercises()}</Tabs.Trigger
            >
            <Tabs.Trigger value="advanced" class="w-full"
                >{m.teacher_admin_cm_tab_advanced()}</Tabs.Trigger
            >
        </Tabs.List>
        <Tabs.Content value="general" class="grid gap-4 rounded-lg border p-8">
            <div>
                <h3 class="text-xl font-bold">{m.teacher_admin_cm_tab_general()}</h3>
                <p class="text-muted-foreground text-sm">
                    {m.teacher_admin_cm_tab_general_body()}
                </p>
            </div>
            {@render TabGeneral()}
        </Tabs.Content>
        <Tabs.Content value="participants" class="grid gap-4 rounded-lg border p-8">
            <div>
                <h3 class="text-xl font-bold">{m.teacher_admin_cm_tab_participants()}</h3>
                <p class="text-muted-foreground text-sm">
                    {m.teacher_admin_cm_tab_participants_body()}
                </p>
            </div>
            {@render TabParticipants()}
        </Tabs.Content>
        <Tabs.Content value="exercises" class="grid gap-4 rounded-lg border p-8">
            <div>
                <h3 class="text-xl font-bold">{m.teacher_admin_cm_tab_exercises()}</h3>
                <p class="text-muted-foreground text-sm">
                    {m.teacher_admin_cm_tab_exercises_body()}
                </p>
            </div>
            {@render TabExercises()}
        </Tabs.Content>
        <Tabs.Content value="advanced" class="grid gap-4 rounded-lg border p-8">
            <div>
                <h3 class="text-xl font-bold">{m.teacher_admin_cm_tab_advanced()}</h3>
                <p class="text-muted-foreground text-sm">
                    {m.teacher_admin_cm_tab_advanced_body()}
                </p>
            </div>
            {@render TabAdvanced()}
        </Tabs.Content>
    </Tabs.Root>
</div>

{#snippet TabGeneral()}
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
                label={m.global_title()}
                id="title"
                type="text"
                value={data.course.title}
                serverResp={undefined}
            />
            <ErrorableInput
                label={m.global_description()}
                id="description"
                type="text"
                value={data.course.description}
                serverResp={undefined}
            />
            <div class="flex gap-2">
                <Label for="isExam">{m.teacher_admin_cm_checkbox_exam()}</Label>
                <input type="checkbox" id="isExam" name="isExam" checked={data.course.isExam} />
            </div>
            <div class="flex gap-2">
                <Label for="isVisible">{m.teacher_admin_cm_checkbox_visible_students()}</Label>
                <input
                    type="checkbox"
                    id="isVisible"
                    name="isVisible"
                    checked={data.course.isVisible}
                />
            </div>
            <Button type="submit">{m.global_save()}</Button>
        </div>
    </form>
{/snippet}

{#snippet TabParticipants()}
    <DataTable data={data.course.students} {columns} dialog={m.teacher_admin_cm_add_students()}>
        {#snippet createDialog({ dialogClose })}
            <form
                method="POST"
                action="?/addStudent"
                use:enhance={() => {
                    return ({ result, update }) => {
                        console.log(result);
                        if (result.type == "success") {
                            dialogClose();
                            update({ invalidateAll: true });
                        } else {
                            update();
                        }
                    };
                }}
                class="flex flex-col gap-2"
            >
                <ErrorableInput
                    label="E-Mail"
                    id="username"
                    type="text"
                    serverResp={form?.username}
                />
                <Button type="submit" class="w-full">{m.global_add()}</Button>
            </form>
        {/snippet}
    </DataTable>
{/snippet}

{#snippet TabExercises()}
    {#each data.exercises as group}
        <div class="bg-muted-foreground/5 rounded-md p-2">
            <span class="block w-full text-center text-lg font-bold">{group.title}</span>
            {#each group.exercises as exercise, i}
                <div class="flex items-center justify-between p-2">
                    <div>
                        <h2 class="text-md font-semibold">{exercise.title}</h2>
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
                {#if i < group.exercises.length - 1}
                    <Separator />
                {/if}
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
{/snippet}

{#snippet TabAdvanced()}
    <div class="space-y-4">
        <form method="POST" action="?/deleteCourse" use:enhance onsubmit={invalidateAll}>
            <Button type="submit" variant="destructive">{m.teacher_admin_cm_delete_course()}</Button
            >
        </form>
    </div>
{/snippet}
