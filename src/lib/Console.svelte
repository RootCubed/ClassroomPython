<script>
    export let stdout = "";
</script>

<div class="flex h-full flex-col bg-zinc-300 text-gray-900 dark:bg-zinc-900 dark:text-gray-300">
    <span class="block w-full bg-zinc-200 p-2 dark:bg-zinc-800">Konsole</span>
    <div class="h-full overflow-auto p-2">
        {#each stdout.split("\n") as line}
            <pre>{line}</pre>
        {/each}
    </div>
</div>
