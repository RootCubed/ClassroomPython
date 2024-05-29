<script>
    export let stdout = "";

    $: console.log(stdout);
</script>

<div class="overflow-auto text-gray-900 dark:text-gray-300">
    <span class="sticky top-0 block w-full border-t-gray-700 bg-slate-400 p-2 dark:bg-slate-800"
        >Konsole</span
    >
    <div class="p-2">
        {#each stdout.split("\n") as line}
            <pre>{line}</pre>
        {/each}
    </div>
</div>
