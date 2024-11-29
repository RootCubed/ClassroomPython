<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import { ChevronDown, FileText, Play, Rocket, Save, Square } from "lucide-svelte";
    import LoadingSpinner from "./LoadingSpinner.svelte";

    export let onExecute = () => {};
    export let onCancel = () => {};
    export let onSave = () => {};
    export let onSubmit = async () => {};

    export let runReady: boolean;
    export let currTestcaseNum: number;

    let isExecuting = false;
    let isSaving = false;
    let isSubmitting = false;

    export let inputSource: "userInput" | "fileInput" = "userInput";

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
            <div class="relative flex flex-row">
                <Tooltip.Trigger asChild let:builder>
                    <Button
                        builders={[builder]}
                        on:click={handleExecute}
                        variant="secondary"
                        class="rounded-r-none bg-green-500 hover:bg-green-600 dark:bg-green-800 dark:hover:bg-green-900"
                        disabled={!runReady}
                    >
                        {#if !runReady}
                            <LoadingSpinner />
                        {:else}
                            <Play />
                        {/if}
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Code ausführen</Tooltip.Content>
                <span class="inline-block w-px bg-green-600 dark:bg-green-900"></span>

                <DropdownMenu.Root>
                    <DropdownMenu.Trigger
                        class="w-auto rounded-r-sm bg-green-500 px-1 hover:bg-green-600 dark:bg-green-800 dark:hover:bg-green-900"
                    >
                        <ChevronDown size={16} />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content class="w-60">
                        <DropdownMenu.Label>Eingabe</DropdownMenu.Label>
                        <DropdownMenu.Separator />
                        <DropdownMenu.RadioGroup bind:value={inputSource}>
                            <DropdownMenu.RadioItem value="userInput">
                                <div class="flex flex-col">
                                    Benutzereingabe
                                    <span class="text-xs text-gray-500 dark:text-gray-400">
                                        <code>input()</code> öffnet ein Eingabefeld für Benutzereingaben.
                                    </span>
                                </div>
                            </DropdownMenu.RadioItem>
                            <DropdownMenu.RadioItem value="fileInput">
                                <div class="flex flex-col">
                                    Vordefinierte Eingabe
                                    <span class="text-xs text-gray-500 dark:text-gray-400">
                                        <code>input()</code> holt sich die Eingabe von vordefinierten
                                        Testfall-Dateien.
                                    </span>
                                </div>
                            </DropdownMenu.RadioItem>
                        </DropdownMenu.RadioGroup>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
                {#if inputSource == "fileInput"}
                    <span
                        class="pointer-events-none absolute left-7 top-3 rounded-md p-2 font-mono text-xs font-bold text-gray-700 dark:text-gray-200"
                    >
                        T{currTestcaseNum + 1}
                    </span>
                {/if}
            </div>
        {:else}
            <Tooltip.Trigger asChild let:builder>
                <Button
                    builders={[builder]}
                    variant="secondary"
                    on:click={onCancel}
                    class="bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-800 dark:hover:bg-rose-900"
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
                class="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900"
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
