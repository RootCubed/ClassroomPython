<script lang="ts">
    import { onMount } from "svelte";
    import ace from "ace-builds";
    import "ace-builds/src-min-noconflict/mode-python";
    import "ace-builds/src-min-noconflict/theme-monokai";
    import "ace-builds/src-min-noconflict/ext-searchbox";
    import "ace-builds/src-min-noconflict/ext-language_tools";

    export let value: string = "";
    export let lang: string = "";
    export let theme: string = "";

    let editorElement: HTMLElement;
    let editor: ace.Ace.Editor;

    $: if (editor) {
        editor.setTheme("ace/theme/" + theme);
    }
    $: if (editor) {
        editor.getSession().setMode("ace/mode/" + lang);
    }

    export function setCode(code: string) {
        value = code;
        editor.setValue(code, 2);
    }

    onMount(async () => {
        editor = ace.edit(editorElement);

        editor.getSession().setMode("ace/mode/" + lang);
        editor.setTheme("ace/theme/" + theme);
        setCode(value);
        editor.setFontSize(16);

        editor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
        });

        editor.on("change", () => {
            value = editor.getValue();
        });
    });
</script>

<div class="h-full w-full" bind:this={editorElement} />
