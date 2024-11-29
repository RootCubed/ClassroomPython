<script lang="ts">
    import { onMount } from "svelte";
    import ace from "ace-builds";
    import "ace-builds/src-min-noconflict/mode-python";
    import "ace-builds/src-min-noconflict/theme-one_dark";
    import "ace-builds/src-min-noconflict/ext-searchbox";
    import "ace-builds/src-min-noconflict/ext-language_tools";

    export let value: string = "";
    export let disabled: boolean = false;

    let editorElement: HTMLElement;
    let editor: ace.Ace.Editor;

    export function setCode(code: string) {
        value = code;
        editor.setValue(code, 2);
    }

    $: editor?.setReadOnly(disabled);

    onMount(async () => {
        editor = ace.edit(editorElement);

        editor.getSession().setMode("ace/mode/python");
        editor.setTheme("ace/theme/one_dark");
        setCode(value);

        editor.setOptions({
            enableBasicAutocompletion: true
        });

        editor.on("change", () => {
            value = editor.getValue();
        });
    });
</script>

<div class="ace-editor h-full w-full" bind:this={editorElement}></div>

<style>
    /* This is easier to write directly in CSS */
    .ace-editor {
        font-family: "Iosevka Web", monospace;
        font-size: 14px;
        font-weight: 450;
        font-stretch: expanded;
        font-variant-ligatures: none;
    }
</style>
