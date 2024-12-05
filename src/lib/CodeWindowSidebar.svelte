<script lang="ts">
    import type { ExerciseView } from "./page-types";
    import Separator from "./components/ui/separator/separator.svelte";
    import TestcaseList from "./TestcaseList.svelte";
    import * as m from "$lib/paraglide/messages";

    export let editMode: boolean = false;
    export let exercise: Pick<ExerciseView, "description" | "testcases">;
    export let exerciseURL: string;

    export let currTestcaseNum: number;
</script>

<div class="flex h-full flex-col p-2">
    <div class="flex flex-1 flex-col overflow-auto">
        <h2 class="text-center text-lg">{m.code_task_description()}</h2>
        {#if editMode}
            <textarea
                class="mb-2 w-full flex-1 resize-none bg-zinc-800 p-2 text-white"
                bind:value={exercise.description}
            ></textarea>
        {:else if exercise.description}
            <p class="p-4 text-justify" lang="de">
                {#each exercise.description.split("\n") as line}
                    {line}
                    <br />
                {/each}
            </p>
        {/if}
    </div>
    <div class="grid flex-1 grid-cols-1 grid-rows-[auto_1fr] overflow-hidden">
        <div>
            <Separator />
            <h2 class="p-2 text-center text-lg">{m.code_testcases()}</h2>
        </div>
        <div>
            <TestcaseList
                {editMode}
                {exerciseURL}
                testcases={exercise.testcases}
                bind:currTestcaseNum
            />
        </div>
    </div>
</div>
