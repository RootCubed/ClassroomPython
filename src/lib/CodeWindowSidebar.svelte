<script lang="ts">
    import { Markdown, type Plugin } from "svelte-exmarkdown";
    import remarkMath from "remark-math";
    import rehypeKatex from "rehype-katex";
    import "katex/dist/katex.min.css";

    import Separator from "./components/ui/separator/separator.svelte";

    import TestcaseList from "./TestcaseList.svelte";
    import type { ExerciseView } from "./page-types";

    import * as m from "$lib/paraglide/messages";

    interface Props {
        editMode?: boolean;
        exercise: Pick<ExerciseView, "description" | "testcases">;
        currTestcaseNum: number;
    }

    let {
        editMode = false,
        exercise = $bindable(),
        currTestcaseNum = $bindable()
    }: Props = $props();

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
        <TestcaseList {editMode} bind:testcases={exercise.testcases} bind:currTestcaseNum />
    </div>
</div>

<style>
    :global {
        .md-container li {
            list-style: inside;
        }
    }
</style>
