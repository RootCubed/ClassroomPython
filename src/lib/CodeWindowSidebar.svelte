<script lang="ts">
    import type { ExerciseView } from "./page-types";
    import Separator from "./components/ui/separator/separator.svelte";
    import TestcaseList from "./TestcaseList.svelte";
    import * as m from "$lib/paraglide/messages";
    import { Markdown, type Plugin } from "svelte-exmarkdown";
    import remarkMath from "remark-math";
    import rehypeKatex from "rehype-katex";
    import "katex/dist/katex.min.css";

    export let editMode: boolean = false;
    export let exercise: Pick<ExerciseView, "description" | "testcases">;
    export let exerciseURL: string;

    export let currTestcaseNum: number;

    const mdPlugins: Plugin[] = [{ remarkPlugin: [remarkMath], rehypePlugin: [rehypeKatex] }];
</script>

<div class="grid h-full grid-rows-2 p-2">
    <div class="flex flex-1 flex-col overflow-auto">
        <h2 class="text-center text-lg">{m.code_task_description()}</h2>
        {#if editMode}
            <textarea
                class="mb-2 w-full flex-1 resize-none bg-zinc-800 p-2 text-white"
                bind:value={exercise.description}
            ></textarea>
        {:else if exercise.description}
            <div class="md-container flex flex-col gap-2 p-4" lang="de">
                <Markdown md={exercise.description} plugins={mdPlugins} />
            </div>
        {/if}
    </div>
    <div class="flex flex-1 flex-col overflow-hidden">
        <div>
            <Separator />
            <h2 class="p-2 text-center text-lg">{m.code_testcases()}</h2>
        </div>
        <TestcaseList
            {editMode}
            {exerciseURL}
            testcases={exercise.testcases}
            bind:currTestcaseNum
        />
    </div>
</div>

<style>
    :global {
        .md-container li {
            list-style: inside;
        }
    }
</style>
