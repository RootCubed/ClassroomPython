<script lang="ts">
    export let consoleOutput: { type: "stdout" | "stderr"; text: string }[] = [];
</script>

<div class="flex h-full flex-col bg-zinc-300 text-gray-900 dark:bg-zinc-900 dark:text-gray-300">
    <span class="block w-full bg-zinc-200 p-2 dark:bg-zinc-800">Konsole</span>
    <div class="h-full overflow-auto p-2">
        {#each consoleOutput as chunk}
            {#if chunk.type === "stdout"}
                <pre>{chunk.text}</pre>
            {:else if chunk.type === "stderr"}
                <pre class="text-red-500">{chunk.text}</pre>
            {/if}
        {/each}
    </div>
</div>
