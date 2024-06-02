<script lang="ts">
    import CodeWindow from "$lib/CodeWindow.svelte";

    import { loadedExercise } from "$lib/page-state";
</script>

<CodeWindow initialCode={$loadedExercise.code} submissionID={$loadedExercise.id} />
