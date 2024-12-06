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
    import { invalidateAll } from "$app/navigation";

    type TestcaseView = ExerciseView["testcases"][0];

    interface Props {
        editMode?: boolean;
        testcases: TestcaseView[];
        exerciseURL: string;
        currTestcaseNum?: number;
    }

    let {
        editMode = false,
        testcases = $bindable(),
        exerciseURL,
        currTestcaseNum = $bindable(0)
    }: Props = $props();

    const defaultTestcase = {
        id: "",
        input: "",
        expectedOutput: "",
        exerciseId: "",
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

    async function saveTestcase() {
        if (!currentTest) {
            return;
        }
        if (currentTest.id == "") {
            await fetch(`${exerciseURL}/testcase/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(currentTest)
            });
        } else {
            await fetch(`${exerciseURL}/testcase/${currentTest.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(currentTest)
            });
        }
        invalidateAll();
    }

    async function deleteTestcase(test: TestcaseView | null) {
        if (test == null) {
            return;
        }
        testcases = testcases.filter((tc) => tc.id != test.id);
        currTestcaseNum--;
        await fetch(`${exerciseURL}/testcase/${test.id}`, {
            method: "DELETE"
        });
        invalidateAll();
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
                    onUpdate={(value) => (currentTest.input = value)}
                />
                <Label for="expectedOutput">{m.code_testcase_expected_output()}</Label>
                <Input
                    disabled={!editMode}
                    id="expectedOutput"
                    bind:value={currentTest.expectedOutput}
                />
                {#if editMode}
                    <div class="flex flex-row justify-around gap-2">
                        <Button
                            variant="destructive"
                            onclick={() => {
                                deleteTestcase(currentTest);
                            }}
                        >
                            {m.global_delete()}
                        </Button>
                        <Button variant="secondary" onclick={saveTestcase}>{m.global_save()}</Button
                        >
                    </div>
                {/if}
            </div>
            <div class="flex flex-col gap-2 overflow-y-auto">
                {#key currentTest}
                    {#each testcases as tc, i}
                        <Button
                            variant="secondary"
                            class={cn(
                                "flex cursor-pointer select-none items-center justify-between gap-1 rounded-l-none bg-zinc-200 px-2 hover:bg-opacity-50 dark:bg-zinc-800",
                                i != currTestcaseNum && "ml-2 bg-opacity-50"
                            )}
                            onclick={() => {
                                currTestcaseNum = i;
                            }}
                        >
                            <span class="text-sm">Testcase {i + 1}</span>
                            <div
                                class={cn(
                                    "flex cursor-pointer select-none items-center justify-between gap-1 rounded-sm p-1",
                                    testcaseCol(tc),
                                    i != currTestcaseNum && "ml-2 bg-opacity-50"
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
                        </Button>
                    {/each}
                {/key}
                {#if editMode}
                    <Button
                        class="ml-2 flex w-8 cursor-pointer select-none gap-1 bg-zinc-200 px-2 hover:bg-opacity-50 dark:bg-zinc-800"
                        onclick={() => {
                            currTestcaseNum = testcases.length;
                            testcases = [
                                ...testcases,
                                { ...defaultTestcase, orderNum: testcases.length }
                            ];
                        }}
                    >
                        <span class="text-center">+</span>
                    </Button>
                {/if}
            </div>
        {:else}
            <span class="text-center text-sm text-muted-foreground"
                >{m.code_testcase_no_testcases()}</span
            >
        {/if}
    {/key}
</div>
