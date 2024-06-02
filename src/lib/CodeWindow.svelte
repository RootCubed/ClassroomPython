<script lang="ts">
    import PyodideWorker from "$lib/pyodide.worker?worker";

    import * as Resizable from "$lib/components/ui/resizable";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";

    import AceEditor from "./AceEditor.svelte";
    import Console from "./Console.svelte";
    import Toolbar from "./Toolbar.svelte";

    import { beforeNavigate, goto } from "$app/navigation";
    import { browser } from "$app/environment";

    let pyodideWorker: Worker;

    let codeExecutionResolve: (value: unknown) => void;
    let consoleOutput: { type: "stdout" | "stderr"; text: string }[] = [];
    let runReady = false;

    // For interrupting the Python code
    let interruptBuffer: Uint8Array;

    if (browser) {
        pyodideWorker = new PyodideWorker();

        interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));

        pyodideWorker.addEventListener("message", (ev) => {
            if (ev.data.type === "ready") {
                runReady = true;
                pyodideWorker.postMessage({
                    type: "setInterruptBuffer",
                    buffer: interruptBuffer
                });
            } else if (ev.data.type === "done") {
                codeExecutionResolve(true);
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

    export let initialCode: string;
    export let submissionID: string | null = null;

    let userCode = initialCode;
    let lastSavedCode = userCode;

    async function runCode() {
        interruptBuffer[0] = 0; // Reset interrupt
        pyodideWorker.postMessage({
            type: "run",
            python: userCode
        });

        consoleOutput = [];

        await new Promise((resolve) => {
            codeExecutionResolve = resolve;
        });
    }

    async function cancelExecution() {
        console.log(":(");
        interruptBuffer[0] = 2; // SIGINT
    }

    async function submitCode() {
        if (!submissionID) {
            console.error("No submission ID");
            return;
        }
        const resp = await fetch(`/exercise/${submissionID}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: userCode
        });
        if (resp.ok) {
            lastSavedCode = userCode;
        } else {
            console.error("Failed to submit code");
        }
    }

    async function saveCode() {
        const resp = await fetch(`/exercise/${submissionID}/save`, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: userCode
        });
        if (resp.ok) {
            lastSavedCode = userCode;
        } else {
            console.error("Failed to submit code");
        }
    }

    let editor: AceEditor | undefined;

    $: if (editor) {
        editor.setCode(initialCode);
        lastSavedCode = initialCode;
        consoleOutput = [];
    }

    let leaveConfirmWindow = {
        open: false,
        destination: ""
    };

    function forceNavigate() {
        lastSavedCode = userCode;
        goto(leaveConfirmWindow.destination);
    }

    beforeNavigate(async (navigation) => {
        if (userCode !== lastSavedCode) {
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
            <AlertDialog.Action on:click={forceNavigate}
                >Ohne Speichern fortfahren</AlertDialog.Action
            >
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<Resizable.PaneGroup direction="vertical">
    <Resizable.Pane>
        <div class="flex h-full flex-col gap-2">
            <Toolbar
                {runReady}
                onExecute={runCode}
                onCancel={cancelExecution}
                onSave={saveCode}
                onSubmit={submitCode}
            />
            <AceEditor bind:value={userCode} bind:this={editor} />
        </div>
    </Resizable.Pane>
    <Resizable.Handle withHandle />
    <Resizable.Pane defaultSize={20}>
        <Console {consoleOutput} />
    </Resizable.Pane>
</Resizable.PaneGroup>
