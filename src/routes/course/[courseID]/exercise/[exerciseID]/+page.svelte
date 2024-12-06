<script lang="ts">
    import { page } from "$app/stores";
    import CodeWindow from "$lib/CodeWindow.svelte";

    import { loadedExercise } from "$lib/page-state";
</script>

{#key $page.url}
    {#if $loadedExercise}
        <CodeWindow
            exercise={$loadedExercise}
            exerciseURL="/course/{$page.params.courseID}/exercise/{$loadedExercise.id}"
        />
    {/if}
{/key}
