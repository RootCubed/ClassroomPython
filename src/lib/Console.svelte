<script lang="ts">
    import type { ConsoleOutput } from "./pyodide-mgr.svelte";

    import * as m from "$lib/paraglide/messages";

    let { consoleOutput = [] }: { consoleOutput: ConsoleOutput[] } = $props();

    let scrollContainer: HTMLElement | null = null;

    $effect(() => {
        if (consoleOutput.length && scrollContainer != null) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    });
</script>

<div class="flex h-full flex-col bg-zinc-300 text-gray-900 dark:bg-zinc-900 dark:text-gray-300">
    <span class="w-full bg-zinc-200 p-2 dark:bg-zinc-800">{m.code_console()}</span>
    <div class="relative h-full overflow-auto" bind:this={scrollContainer}>
        <div class="absolute top-0 left-0 p-2">
            {#each consoleOutput as chunk}
                {#if chunk.type === "stdout"}
                    <pre>{chunk.text}</pre>
                {:else if chunk.type === "stderr"}
                    <pre class="text-red-500">{chunk.text}</pre>
                {:else if chunk.type === "extra"}
                    <pre class="text-green-500">{chunk.text}</pre>
                {/if}
            {/each}
        </div>
    </div>
</div>
