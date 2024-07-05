<script lang="ts">
    import CodeWindow from "$lib/CodeWindow.svelte";

    import { loadedExercise } from "$lib/page-state";
</script>

{#if $loadedExercise}
    <CodeWindow initialCode={$loadedExercise.codeTemplate} submissionID={$loadedExercise.id} />
{/if}
