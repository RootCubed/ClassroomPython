<script lang="ts">
    import { loadedExercise } from "$lib/page-state";
    import type { LayoutData } from "./$types";

    export let data: LayoutData;
    $: $loadedExercise = data.exercise;
</script>

<slot />
