<script lang="ts">
    import { untrack } from "svelte";

    import { Button } from "$lib/components/ui/button";
    import Input from "$lib/components/ui/input/input.svelte";
    import { Label } from "$lib/components/ui/label";

    import { Check, X, CircleDashed, Trash } from "lucide-svelte";
    import { cn } from "$lib/utils";

    import AceEditor from "./AceEditor.svelte";
    import type { ExerciseView } from "./page-types";

    import * as m from "$lib/paraglide/messages";

    type TestcaseView = ExerciseView["testcases"][0];

    interface Props {
        editMode?: boolean;
        testcases: TestcaseView[];
        currTestcaseNum?: number;
    }

    let {
        editMode = false,
        testcases = $bindable(),
        currTestcaseNum = $bindable(0)
    }: Props = $props();

    const defaultTestcase = {
        id: "",
        input: "",
        expectedOutput: "",
        testcaseResult: null
    };

    let currentTest: TestcaseView | null = $derived.by(() => {
        if (testcases.length == 0) {
            if (!editMode) {
                return null;
            }
            return { ...defaultTestcase, orderNum: 0 };
        }
        if (currTestcaseNum >= testcases.length) {
            untrack(() => (currTestcaseNum = 0));
        }
        return testcases[currTestcaseNum];
    });

    let testInputEditor: AceEditor | undefined = $state();

    function onInputChange(value: string) {
        if (!currentTest) {
            return;
        }
        currentTest.input = value;
    }

    function testcaseCol(tc: TestcaseView) {
        if (tc.testcaseResult == null) {
            return "bg-zinc-300 dark:bg-zinc-600";
        }
        return tc.testcaseResult.passed
            ? "bg-green-400 dark:bg-green-800"
            : "bg-red-400 dark:bg-red-800";
    }
</script>

<div class="flex flex-1 flex-row overflow-hidden">
    {#key [currentTest, testcases]}
        {#if currentTest != null}
            <div class="flex flex-1 flex-col gap-2 bg-zinc-200 p-2 dark:bg-zinc-800">
                <Label>{m.code_testcase_program_inputs()}</Label>
                <AceEditor
                    disabled={!editMode}
                    lineNumbers={false}
                    initialValue={currentTest.input}
                    bind:this={testInputEditor}
                    onUpdate={onInputChange}
                />
                <Label for="expectedOutput">{m.code_testcase_expected_output()}</Label>
                <Input
                    disabled={!editMode}
                    id="expectedOutput"
                    bind:value={currentTest.expectedOutput}
                />
            </div>
            <div class="flex flex-col gap-2 overflow-y-auto">
                {#each testcases as tc, i (tc.id)}
                    <div class={cn("flex gap-2 rounded-r-md", i != currTestcaseNum && "ml-2")}>
                        <Button
                            variant="secondary"
                            class={cn(
                                "hover:!bg-opacity-85 flex flex-1 cursor-pointer items-center justify-between gap-1 rounded-l-none bg-zinc-200 p-2 select-none dark:bg-zinc-800",
                                i != currTestcaseNum && "bg-opacity-50"
                            )}
                            onclick={() => {
                                currTestcaseNum = i;
                            }}
                        >
                            <span class="text-sm">Testcase {i + 1}</span>
                            {#if !editMode}
                                <div
                                    class={cn(
                                        "flex cursor-pointer items-center justify-between gap-1 rounded-sm p-1 select-none",
                                        testcaseCol(tc),
                                        i != currTestcaseNum && "bg-opacity-50 ml-2"
                                    )}
                                >
                                    {#if tc.testcaseResult == null}
                                        <CircleDashed size={14} />
                                    {:else if tc.testcaseResult.passed}
                                        <Check size={14} />
                                    {:else}
                                        <X size={14} />
                                    {/if}
                                </div>
                            {/if}
                        </Button>
                        {#if editMode}
                            <Button
                                variant="destructive"
                                class="h-auto p-2"
                                onclick={() => {
                                    testcases.splice(i, 1);
                                    if (currTestcaseNum > 0) {
                                        currTestcaseNum--;
                                    }
                                }}
                            >
                                <Trash size={12} />
                            </Button>
                        {/if}
                    </div>
                {/each}
                {#if editMode}
                    <div class="pr-0 pl-2">
                        <Button
                            class="hover:!bg-opacity-85 w-full cursor-pointer bg-zinc-200 px-2 select-none dark:bg-zinc-800"
                            onclick={() => {
                                currTestcaseNum = testcases.length;
                                testcases.push({
                                    ...defaultTestcase,
                                    id: window.crypto.randomUUID(),
                                    orderNum: currTestcaseNum
                                });
                            }}
                        >
                            <span class="text-center text-white">+</span>
                        </Button>
                    </div>
                {/if}
            </div>
        {:else}
            <span class="text-muted-foreground text-center text-sm"
                >{m.code_testcase_no_testcases()}</span
            >
        {/if}
    {/key}
</div>
