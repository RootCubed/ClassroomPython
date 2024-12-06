<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import { ChevronDown, Play, Rocket, RotateCcw, Save, SkipForward, Square } from "lucide-svelte";

    import LoadingSpinner from "./LoadingSpinner.svelte";

    import * as m from "$lib/paraglide/messages";

    let isExecuting = $state(false);
    let isSaving = $state(false);
    let isSubmitting = $state(false);
    let isResetting = $state(false);

    interface Props {
        onExecute?: () => void;
        onCancel?: () => void;
        onSave?: () => void;
        onSubmit?: () => void;
        onReset?: () => void;
        runReady: boolean;
        currTestcaseNum: number;
        hasTestcases: boolean;
        inputSource?: "userInput" | "fileInput" | "runAll";
    }

    let {
        onExecute = () => {},
        onCancel = () => {},
        onSave = () => {},
        onSubmit = async () => {},
        onReset = () => {},
        runReady,
        currTestcaseNum,
        hasTestcases,
        inputSource = $bindable("runAll")
    }: Props = $props();

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

    async function handleReset() {
        isResetting = true;
        await artificialDelay(onReset);
        isResetting = false;
    }
</script>

<div class="flex flex-row items-center gap-2 px-2 [&_svg]:size-6">
    <Tooltip.Provider>
        <Tooltip.Root>
            {#if !isExecuting}
                <div class="relative flex flex-row">
                    <Tooltip.Trigger>
                        {#snippet child({ props })}
                            <Button
                                {...props}
                                onclick={handleExecute}
                                variant="secondary"
                                class="rounded-r-none bg-green-500 hover:bg-green-600 dark:bg-green-800 dark:hover:bg-green-900"
                                disabled={!runReady}
                            >
                                {#if !runReady}
                                    <LoadingSpinner />
                                {:else if inputSource == "runAll"}
                                    <SkipForward />
                                {:else}
                                    <Play />
                                {/if}
                            </Button>
                        {/snippet}
                    </Tooltip.Trigger>
                    <Tooltip.Content>{m.code_execute()}</Tooltip.Content>
                    <span class="inline-block w-px bg-green-600 dark:bg-green-900"></span>

                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger
                            class="w-auto rounded-r-sm bg-green-500 px-1 hover:bg-green-600 dark:bg-green-800 dark:hover:bg-green-900"
                        >
                            <ChevronDown class="!size-4" />
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content class="w-60">
                            <DropdownMenu.Label>{m.code_select_input()}</DropdownMenu.Label>
                            <DropdownMenu.Separator />
                            <DropdownMenu.RadioGroup bind:value={inputSource}>
                                <DropdownMenu.RadioItem value="userInput">
                                    <div class="flex flex-col">
                                        {m.code_input_user_source_title()}
                                        <span class="text-xs text-gray-500 dark:text-gray-400">
                                            {@html m.code_input_user_source_description()}
                                        </span>
                                    </div>
                                </DropdownMenu.RadioItem>
                                <DropdownMenu.RadioItem value="fileInput" disabled={!hasTestcases}>
                                    <div class="flex flex-col">
                                        {m.code_input_predefined_source_title()}
                                        <span class="text-xs text-gray-500 dark:text-gray-400">
                                            {@html m.code_input_predefined_source_description()}
                                        </span>
                                    </div>
                                </DropdownMenu.RadioItem>
                                <DropdownMenu.RadioItem value="runAll" disabled={!hasTestcases}>
                                    <div class="flex flex-col">
                                        {m.code_input_all_testcases_title()}
                                        <span class="text-xs text-gray-500 dark:text-gray-400">
                                            {@html m.code_input_all_testcases_description()}
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
                <Tooltip.Trigger>
                    {#snippet child({ props })}
                        <Button
                            {...props}
                            variant="secondary"
                            onclick={onCancel}
                            class="bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-800 dark:hover:bg-rose-900"
                        >
                            <Square />
                        </Button>
                    {/snippet}
                </Tooltip.Trigger>
                <Tooltip.Content>{m.global_cancel()}</Tooltip.Content>
            {/if}
        </Tooltip.Root>
        <Tooltip.Root>
            <Tooltip.Trigger>
                {#snippet child({ props })}
                    <Button {...props} variant="secondary" onclick={handleSave} disabled={isSaving}>
                        {#if isSaving}
                            <LoadingSpinner />
                        {:else}
                            <Save />
                        {/if}
                    </Button>
                {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>{m.code_save()}</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root>
            <Tooltip.Trigger>
                {#snippet child({ props })}
                    <Button
                        {...props}
                        variant="destructive"
                        onclick={handleReset}
                        disabled={isResetting}
                    >
                        {#if isResetting}
                            <LoadingSpinner />
                        {:else}
                            <RotateCcw />
                        {/if}
                    </Button>
                {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>{m.code_reset()}</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root>
            <Tooltip.Trigger>
                {#snippet child({ props })}
                    <Button
                        {...props}
                        variant="secondary"
                        onclick={handleSubmit}
                        class="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900"
                        disabled={isSubmitting}
                    >
                        {#if isSubmitting}
                            <LoadingSpinner />
                        {:else}
                            <Rocket />
                        {/if}
                    </Button>
                {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>{m.global_submit()}</Tooltip.Content>
        </Tooltip.Root>
    </Tooltip.Provider>
</div>
