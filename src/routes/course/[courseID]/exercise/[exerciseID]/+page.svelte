<script lang="ts">
    import { page } from "$app/stores";
    import CodeWindow from "$lib/CodeWindow.svelte";

    import { loadedExercise } from "$lib/page-state";
    import type { ExerciseView } from "$lib/page-types";

    function getCode(exercise: ExerciseView) {
        return exercise.saves[0]?.code ?? exercise.codeTemplate;
    }
</script>

{#if $loadedExercise}
    <CodeWindow
        initialCode={getCode($loadedExercise)}
        exerciseURL="/course/{$page.params.courseID}/exercise/{$loadedExercise.id}"
    />
{/if}
