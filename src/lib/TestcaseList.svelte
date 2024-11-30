<script lang="ts">
    import AceEditor from "./AceEditor.svelte";

    import { Check, X, CircleDashed } from "lucide-svelte";
    import type { ExerciseView } from "./page-types";
    import { Label } from "./components/ui/label";
    import Input from "./components/ui/input/input.svelte";
    import { Button } from "./components/ui/button";
    import { cn } from "./utils";
    import { invalidateAll } from "$app/navigation";

    type TestcaseView = ExerciseView["testcases"][0];

    export let editMode: boolean = false;
    export let testcases: TestcaseView[];
    export let exerciseURL: string;

    export let currTestcaseNum = 0;

    let inputEditor: AceEditor;

    const defaultTestcase = {
        id: "",
        input: "",
        expectedOutput: "",
        exerciseId: "",
        testcaseResults: []
    };

    let currentTest: TestcaseView | null = null;
    $: if (testcases.length > 0 && currTestcaseNum < testcases.length) {
        currentTest = testcases[currTestcaseNum];
        inputEditor?.setCode(currentTest.input);
    } else if (editMode) {
        testcases = [{ ...defaultTestcase }];
        currentTest = testcases[0];
    } else {
        currentTest = null;
    }

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
        if (tc.testcaseResults.length == 0) {
            return "bg-zinc-300 dark:bg-zinc-600";
        }
        return tc.testcaseResults[0].passed
            ? "bg-green-400 dark:bg-green-800"
            : "bg-red-400 dark:bg-red-800";
    }
</script>

<div class="grid h-full grid-cols-[1fr_auto] grid-rows-1 overflow-hidden">
    {#if currentTest != null}
        <div class="flex flex-col gap-2 bg-zinc-200 p-2 dark:bg-zinc-800">
            <Label>Programm-Eingaben</Label>
            <AceEditor
                disabled={!editMode}
                bind:value={currentTest.input}
                bind:this={inputEditor}
            />
            <Label for="expectedOutput">Erwartete Ausgabe</Label>
            <Input
                disabled={!editMode}
                id="expectedOutput"
                bind:value={currentTest.expectedOutput}
            />
            {#if editMode}
                <div class="flex flex-row justify-around gap-2">
                    <Button
                        variant="destructive"
                        on:click={() => {
                            deleteTestcase(currentTest);
                        }}
                    >
                        Löschen
                    </Button>
                    <Button variant="secondary" on:click={saveTestcase}>Speichern</Button>
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
                        on:click={() => {
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
                            {#if tc.testcaseResults.length == 0}
                                <CircleDashed size={14} />
                            {:else if tc.testcaseResults[0].passed}
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
                    on:click={() => {
                        currTestcaseNum = testcases.length;
                        testcases = [...testcases, { ...defaultTestcase }];
                    }}
                >
                    <span class="text-center">+</span>
                </Button>
            {/if}
        </div>
    {:else}
        <span class="text-center text-sm text-muted-foreground">Keine Testfälle verfügbar</span>
    {/if}
</div>
