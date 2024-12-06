<script lang="ts">
    import { onMount } from "svelte";

    import ace from "ace-builds";
    import "ace-builds/src-min-noconflict/mode-python";
    import "ace-builds/src-min-noconflict/theme-one_dark";
    import "ace-builds/src-min-noconflict/ext-searchbox";
    import "ace-builds/src-min-noconflict/ext-language_tools";

    interface Props {
        initialValue: string;
        disabled?: boolean;
        lineNumbers?: boolean;
        onUpdate?: (value: string) => void;
    }

    let {
        initialValue,
        disabled = false,
        lineNumbers = true,
        onUpdate = () => {}
    }: Props = $props();

    let editorElement: HTMLElement;
    let editor: ace.Ace.Editor;

    let value = $state(initialValue);

    export function setValue(newValue: string) {
        value = newValue;
        editor.setValue(newValue, -1);
    }

    export function getValue() {
        return value;
    }

    $effect(() => onUpdate(value));

    onMount(async () => {
        editor = ace.edit(editorElement);

        editor.getSession().setMode("ace/mode/python");
        editor.setTheme("ace/theme/one_dark");

        editor.setOptions({
            enableBasicAutocompletion: true
        });

        editor.setValue(initialValue, -1);

        editor.on("change", () => {
            value = editor.getValue();
        });

        $effect(() => editor.setReadOnly(disabled));
        $effect(() => editor.renderer.setShowGutter(lineNumbers));
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
    }

    :global(.ace-editor *) {
        font-variant-ligatures: none;
    }
</style>
