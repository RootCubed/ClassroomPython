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

    function saveTestcase() {
        if (!currentTest) {
            return;
        }
        if (currentTest.id == "") {
            fetch(`${exerciseURL}/testcase/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(currentTest)
            });
        } else {
            fetch(`${exerciseURL}/testcase/${currentTest.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(currentTest)
            });
        }
        invalidateAll();
    }

    function testcaseCol(tc: TestcaseView) {
        if (tc.testcaseResults.length == 0) {
            return "bg-zinc-600";
        }
        return tc.testcaseResults[0].passed ? "bg-green-800" : "bg-red-800";
    }
</script>

<div class="grid h-full grid-cols-[1fr_auto] grid-rows-1 overflow-hidden">
    {#if currentTest != null}
        <div class="flex flex-col gap-2 bg-zinc-800 p-2">
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
                            if (currentTest == null) {
                                return;
                            }
                            testcases = testcases.filter((tc) => tc.id != currentTest?.id);
                            currTestcaseNum--;
                            fetch(`${exerciseURL}/testcase/${currentTest.id}`, {
                                method: "DELETE"
                            });
                            invalidateAll();
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
                        class={cn(
                            "flex cursor-pointer select-none items-center justify-between gap-1 rounded-l-none bg-zinc-800 px-2 text-white hover:bg-zinc-700",
                            i != currTestcaseNum && "ml-2 bg-opacity-50"
                        )}
                        on:click={() => {
                            currTestcaseNum = i;
                        }}
                    >
                        <span class="text-sm">Testcase {i + 1}</span>
                        <div
                            class={cn(
                                "flex cursor-pointer select-none items-center justify-between gap-1 rounded-sm p-1 text-white",
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
                    class="ml-2 flex w-8 cursor-pointer select-none gap-1 bg-zinc-800 px-2 text-white hover:bg-zinc-700"
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
