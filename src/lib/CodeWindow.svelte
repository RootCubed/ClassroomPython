<script lang="ts">
    import * as pyodide from "pyodide";

    import * as Resizable from "$lib/components/ui/resizable";

    import AceEditor from "./AceEditor.svelte";
    import Console from "./Console.svelte";
    import Toolbar from "./Toolbar.svelte";

    import { py } from "./page-state";

    export let initialCode: string;
    export let submissionID: string | null = null;

    let userCode = "";

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
        } else {
            console.error("Failed to submit code");
        }
    }

    let setEditorCode: (code: string) => void = () => {};

    $: setEditorCode(initialCode);
</script>

<Resizable.PaneGroup direction="vertical">
    <Resizable.Pane>
        <div class="flex h-full flex-col gap-2">
            <Toolbar onExecute={runCode} onSubmit={submitCode} />
            <AceEditor
                lang="python"
                theme="monokai"
                bind:value={userCode}
                bind:setCode={setEditorCode}
            />
        </div>
    </Resizable.Pane>
    <Resizable.Handle withHandle />
    <Resizable.Pane defaultSize={20}>
        <Console {stdout} />
    </Resizable.Pane>
</Resizable.PaneGroup>
