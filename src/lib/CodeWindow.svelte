<script lang="ts">
    import * as pyodide from "pyodide";
    import AceEditor from "./AceEditor.svelte";
    import Console from "./Console.svelte";
    import Toolbar from "./Toolbar.svelte";

    let text = "";

    let py: pyodide.PyodideInterface | undefined;

    let stdout = "";

    async function runCode() {
        console.log("Running code");
        if (!py) {
            py = await pyodide.loadPyodide();
        }
        stdout = "";
        py.setStdout({
            write: (text: Uint8Array) => {
                stdout += new TextDecoder().decode(text);
                return text.length;
            }
        });
        const result = py.runPython(text);
        console.log(result);
    }
</script>

<div class="layout">
    <Toolbar onExecute={runCode} />
    <AceEditor lang="python" theme="monokai" bind:value={text} />
    <Console {stdout} />
</div>

<style>
    .layout {
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-rows: auto 1fr 200px;
    }
</style>
