<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import { Play, Rocket, Save, Square } from "lucide-svelte";
    import LoadingSpinner from "./LoadingSpinner.svelte";
    import { cn } from "./utils";

    export let onExecute = () => {};
    export let onCancel = () => {};
    export let onSave = () => {};
    export let onSubmit = async () => {};

    export let runReady: boolean;

    let isExecuting = false;
    let isSaving = false;
    let isSubmitting = false;

    // So that the spinner is briefly visible even if the submission happens instantly
    async function artificialDelay(func: () => any, amount = 200) {
        await Promise.all([func(), new Promise((resolve) => setTimeout(resolve, amount))]);
    }

    async function handleExecute() {
        isExecuting = true;
        await artificialDelay(onExecute);
        isExecuting = false;
    }

    async function handleSave() {
        isSaving = true;
        await artificialDelay(onSave);
        isSaving = false;
    }

    async function handleSubmit() {
        isSubmitting = true;
        await artificialDelay(onSubmit);
        isSubmitting = false;
    }
</script>

<div class="flex flex-row items-center gap-2 px-2">
    <Tooltip.Root>
        {#if !isExecuting}
            <Tooltip.Trigger>
                <Button
                    variant="secondary"
                    on:click={handleExecute}
                    class="bg-green-600 text-white
                hover:bg-green-700 dark:bg-green-800 dark:hover:bg-green-900"
                    disabled={!runReady}
                >
                    {#if !runReady}
                        <LoadingSpinner />
                    {:else}
                        <Play />
                    {/if}
                </Button></Tooltip.Trigger
            >
            <Tooltip.Content>Code ausführen</Tooltip.Content>
        {:else}
            <Tooltip.Trigger asChild let:builder>
                <Button
                    builders={[builder]}
                    variant="secondary"
                    on:click={onCancel}
                    class="bg-rose-600 text-white
                hover:bg-rose-700 dark:bg-rose-800 dark:hover:bg-rose-900"
                >
                    <Square />
                </Button></Tooltip.Trigger
            >
            <Tooltip.Content>Abbrechen</Tooltip.Content>
        {/if}
    </Tooltip.Root>
    <Tooltip.Root>
        <Tooltip.Trigger asChild let:builder>
            <Button
                builders={[builder]}
                variant="secondary"
                on:click={handleSave}
                disabled={isSaving}
            >
                {#if isSaving}
                    <LoadingSpinner />
                {:else}
                    <Save />
                {/if}
            </Button></Tooltip.Trigger
        >
        <Tooltip.Content>Code speichern</Tooltip.Content>
    </Tooltip.Root>
    <Tooltip.Root>
        <Tooltip.Trigger asChild let:builder>
            <Button
                builders={[builder]}
                variant="secondary"
                on:click={handleSubmit}
                class={cn(
                    "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900"
                )}
                disabled={isSubmitting}
            >
                {#if isSubmitting}
                    <LoadingSpinner />
                {:else}
                    <Rocket />
                {/if}
            </Button></Tooltip.Trigger
        >
        <Tooltip.Content>Einreichen</Tooltip.Content>
    </Tooltip.Root>
</div>
