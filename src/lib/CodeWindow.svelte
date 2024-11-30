<script lang="ts">
    import PyodideWorker from "$lib/pyodide.worker?worker";

    import * as Resizable from "$lib/components/ui/resizable";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";

    import AceEditor from "./AceEditor.svelte";
    import Console from "./Console.svelte";
    import Toolbar from "./Toolbar.svelte";

    import { beforeNavigate, goto, invalidateAll } from "$app/navigation";
    import { browser } from "$app/environment";
    import { PanelRightOpen } from "lucide-svelte";
    import type { PaneAPI } from "paneforge";
    import type { ExerciseView } from "./page-types";
    import { Label } from "./components/ui/label";
    import { Button } from "./components/ui/button";
    import Input from "./components/ui/input/input.svelte";
    import { page } from "$app/stores";
    import CodeWindowSidebar from "./CodeWindowSidebar.svelte";
    import { user } from "./page-state";

    type CodeWindowExerciseView = Omit<ExerciseView, "submissions" | "exerciseGroup">;

    export let exercise: CodeWindowExerciseView;
    export let exerciseURL: string;
    export let mode: "USER" | "SUBMISSION_VIEW" | "EDIT" = "USER";

    $: isEditing = mode == "EDIT";

    let editor: AceEditor | undefined;

    let userCode = getCode(exercise);
    let lastSavedCode = userCode;

    let collapsed = false;
    let detailsPane: PaneAPI;

    let currTestcaseNum = 0;
    let inputSource: "userInput" | "fileInput" = "userInput";

    let leaveConfirmWindow = {
        open: false,
        destination: ""
    };

    let pyodideWorker: Worker;
    let interruptBuffer: Uint8Array; // For interrupting the Python code
    let codeExecutionResolve: (value: unknown) => void; // Callback for when the code execution is done
    let consoleOutput: { type: "stdout" | "stderr" | "extra"; text: string }[] = [];
    let runReady = false; // Whether Pyodide is ready

    $: if ($page.url) {
        refreshCode();
        currTestcaseNum = 0;
    }

    if (browser) {
        pyodideWorker = new PyodideWorker();
        interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));

        pyodideWorker.addEventListener("message", (ev) => {
            if (ev.data.type == "ready") {
                runReady = true;
                pyodideWorker.postMessage({
                    type: "setInterruptBuffer",
                    buffer: interruptBuffer
                });
            } else if (ev.data.type == "done") {
                codeExecutionResolve(true);
            } else if (ev.data.type == "inputReq") {
                // TODO: Use a nicer prompt box
                const response = prompt(ev.data.content);
                pyodideWorker.postMessage({
                    type: "stdinResp",
                    buffer: response
                });
            } else {
                consoleOutput = [
                    ...consoleOutput,
                    {
                        type: ev.data.type,
                        text: ev.data.content
                    }
                ];
            }
        });
    }

    function getCode(exercise: CodeWindowExerciseView) {
        return exercise.saves[0]?.code ?? exercise.codeTemplate;
    }

    async function runCode() {
        interruptBuffer[0] = 0; // Reset interrupt
        pyodideWorker.postMessage({
            type: "run",
            python: userCode,
            inputMode: inputSource,
            inputData: exercise.testcases[currTestcaseNum].input
        });

        consoleOutput = [];

        await new Promise((resolve) => {
            codeExecutionResolve = (value: unknown) => {
                if (inputSource == "fileInput") {
                    const currentTest = exercise.testcases[currTestcaseNum];
                    const actualOutput = consoleOutput.map((x) => x.text).join("\n");
                    const correctOutput = currentTest.expectedOutput.trim() == actualOutput.trim();
                    const res = {
                        testcaseId: currentTest.id,
                        userId: $user.id,
                        passed: correctOutput
                    };
                    currentTest.testcaseResults = [res];
                    exercise.testcases = exercise.testcases;
                    consoleOutput = [
                        ...consoleOutput,
                        {
                            type: correctOutput ? "extra" : "stderr",
                            text: correctOutput ? "[OK]" : "[FAIL]"
                        }
                    ];
                }
                resolve(value);
            };
        });
    }

    async function cancelExecution() {
        interruptBuffer[0] = 2; // SIGINT
    }

    async function submitCode() {
        if (!exerciseURL) {
            console.error("No submission ID");
            return;
        }
        const resp = await fetch(`${exerciseURL}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: userCode
        });
        if (resp.ok) {
            lastSavedCode = userCode;
            invalidateAll();
        } else {
            console.error("Failed to submit code");
        }
    }

    async function saveCode() {
        let resp: Response;
        if (isEditing) {
            resp = await fetch(`${exerciseURL}/admin-save`, {
                method: "POST",
                body: JSON.stringify({
                    description: exercise.description,
                    codeTemplate: userCode,
                    title: exercise.title,
                    subtitle: exercise.subtitle
                })
            });
            invalidateAll();
        } else {
            resp = await fetch(`${exerciseURL}/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: userCode
            });
        }
        if (resp.ok) {
            lastSavedCode = userCode;
        } else {
            console.error("Failed to submit code");
        }
    }

    function refreshCode() {
        if (exercise.saves.length > 0) {
            userCode = exercise.saves[0].code;
        } else {
            userCode = exercise.codeTemplate;
        }
        editor?.setCode(userCode);
        lastSavedCode = userCode;
    }

    beforeNavigate(async (navigation) => {
        if (userCode != lastSavedCode && !leaveConfirmWindow.open) {
            if (!navigation.willUnload) {
                leaveConfirmWindow.open = true;
                leaveConfirmWindow.destination = navigation.to?.url.toString() ?? "#";
            }
            navigation.cancel();
        }
    });
</script>

<AlertDialog.Root bind:open={leaveConfirmWindow.open}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Ungespeicherte Änderungen</AlertDialog.Title>
            <AlertDialog.Description>
                Du hast noch ungespeicherte Änderungen. Möchtest du wirklich fortfahren?
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
            <AlertDialog.Action on:click={() => goto(leaveConfirmWindow.destination)}
                >Ohne Speichern fortfahren</AlertDialog.Action
            >
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<Resizable.PaneGroup direction="horizontal">
    <Resizable.Pane>
        <Resizable.PaneGroup direction="vertical">
            <Resizable.Pane>
                <div class="flex h-full flex-col gap-2">
                    <div class="flex flex-row justify-between">
                        {#if !isEditing}
                            <Toolbar
                                {runReady}
                                onExecute={runCode}
                                onCancel={cancelExecution}
                                onSave={saveCode}
                                onSubmit={submitCode}
                                {currTestcaseNum}
                                bind:inputSource
                            />
                        {:else}
                            <form
                                on:submit|preventDefault={saveCode}
                                class="flex w-full items-center justify-between gap-2 px-2"
                            >
                                <div>
                                    <Label for="edit-title">Titel</Label>
                                    <Input id="edit-title" bind:value={exercise.title} />
                                </div>
                                <div>
                                    <Label for="edit-subtitle">Untertitel</Label>
                                    <Input id="edit-subtitle" bind:value={exercise.subtitle} />
                                </div>

                                <Button variant="ghost" type="submit" on:click={saveCode}
                                    >Speichern</Button
                                >
                            </form>
                        {/if}
                        {#if collapsed}
                            <Button
                                class="mr-2 h-full"
                                variant="ghost"
                                on:click={detailsPane.expand}
                            >
                                <PanelRightOpen />
                            </Button>
                        {/if}
                    </div>
                    <AceEditor bind:value={userCode} bind:this={editor} />
                </div>
            </Resizable.Pane>
            <Resizable.Handle withHandle />
            <Resizable.Pane defaultSize={20}>
                <Console {consoleOutput} />
            </Resizable.Pane>
        </Resizable.PaneGroup>
    </Resizable.Pane>
    <Resizable.Handle withHandle={!collapsed} />
    <Resizable.Pane
        collapsible
        defaultSize={40}
        minSize={15}
        collapsedSize={0}
        bind:pane={detailsPane}
        onCollapse={() => (collapsed = true)}
        onExpand={() => (collapsed = false)}
    >
        {#if !collapsed}
            <CodeWindowSidebar {exerciseURL} bind:currTestcaseNum {exercise} editMode={isEditing} />
        {/if}
    </Resizable.Pane>
</Resizable.PaneGroup>
