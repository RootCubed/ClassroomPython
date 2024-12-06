<script lang="ts">
    import * as m from "$lib/paraglide/messages";

    interface ConsoleOutput {
        type: "stdout" | "stderr" | "extra";
        text: string;
    }

    let { consoleOutput = [] }: { consoleOutput: ConsoleOutput[] } = $props();
</script>

<div class="flex h-full flex-col bg-zinc-300 text-gray-900 dark:bg-zinc-900 dark:text-gray-300">
    <span class="block w-full bg-zinc-200 p-2 dark:bg-zinc-800">{m.code_console()}</span>
    <div class="h-full overflow-auto p-2">
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
