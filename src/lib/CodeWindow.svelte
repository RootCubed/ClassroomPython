<script lang="ts">
    import * as pyodide from "pyodide";

    import * as Resizable from "$lib/components/ui/resizable";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";

    import AceEditor from "./AceEditor.svelte";
    import Console from "./Console.svelte";
    import Toolbar from "./Toolbar.svelte";

    import { py } from "./page-state";
    import { beforeNavigate, goto } from "$app/navigation";

    export let initialCode: string;
    export let submissionID: string | null = null;

    let userCode = initialCode;
    let lastSavedCode = userCode;

    let stdout = "";

    async function runCode() {
        console.log("Running code");
        if (!$py) {
            $py = await pyodide.loadPyodide();
        }
        stdout = "";
        $py.setStdout({
            write: (text: Uint8Array) => {
                stdout += new TextDecoder().decode(text);
                return text.length;
            }
        });
        const result = $py.runPythonAsync(userCode);
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
            console.log("Submitted code");
            lastSavedCode = userCode;
        } else {
            console.error("Failed to submit code");
        }
    }

    async function saveCode() {
        lastSavedCode = userCode;
    }

    let editor: AceEditor | undefined;

    $: if (editor) {
        editor.setCode(initialCode);
        lastSavedCode = initialCode;
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
            <Toolbar onExecute={runCode} onSave={saveCode} onSubmit={submitCode} />
            <AceEditor bind:value={userCode} bind:this={editor} />
        </div>
    </Resizable.Pane>
    <Resizable.Handle withHandle />
    <Resizable.Pane defaultSize={20}>
        <Console {stdout} />
    </Resizable.Pane>
</Resizable.PaneGroup>
