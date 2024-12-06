<script lang="ts">
    import type { LayoutData } from "./$types";

    import type { Snippet } from "svelte";

    import { loadedExercise } from "$lib/page-state";

    interface Props {
        data: LayoutData;
        children: Snippet;
    }

    let { data, children }: Props = $props();
    $effect(() => {
        $loadedExercise = data.exercise;
    });
</script>

{@render children()}
