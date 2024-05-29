<script lang="ts">
    import { Button, Tooltip } from "flowbite-svelte";
    import { PlayOutline, RocketOutline } from "flowbite-svelte-icons";

    export let onExecute = () => {
        console.log("asdf");
    };
    export let onSubmit = () => {
        console.log("asdf");
    };
</script>

<div class="p-2">
    <span class="text-lg">Aufgabe 12</span>
    <div class="mt-2 flex flex-row items-center gap-2">
        <Button pill={true} color="green" on:click={onExecute}><PlayOutline /></Button>
        <Tooltip>Code ausführen</Tooltip>
        <Button pill={true} color="purple" on:click={onSubmit}><RocketOutline /></Button>
        <Tooltip>Einreichen</Tooltip>
    </div>
</div>

<style>
    * {
        z-index: 10;
    }
</style>
