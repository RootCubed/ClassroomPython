<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import { Play, Rocket, Save } from "lucide-svelte";

    export let onExecute = () => {};
    export let onSubmit = () => {};
</script>

<div class="flex flex-row items-center gap-2 px-2">
    <Tooltip.Root>
        <Tooltip.Trigger>
            <Button
                variant="secondary"
                on:click={onExecute}
                class="bg-green-600 text-white
                hover:bg-green-700 dark:bg-green-800 dark:hover:bg-green-900"><Play /></Button
            ></Tooltip.Trigger
        >
        <Tooltip.Content>Code ausführen</Tooltip.Content>
    </Tooltip.Root>
    <Tooltip.Root>
        <Tooltip.Trigger>
            <Button variant="destructive"><Save /></Button></Tooltip.Trigger
        >
        <Tooltip.Content>Code speichern</Tooltip.Content>
    </Tooltip.Root>
    <Tooltip.Root>
        <Tooltip.Trigger>
            <Button
                variant="secondary"
                on:click={onSubmit}
                class="bg-blue-600 text-white
                hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900"><Rocket /></Button
            ></Tooltip.Trigger
        >
        <Tooltip.Content>Einreichen</Tooltip.Content>
    </Tooltip.Root>
</div>
