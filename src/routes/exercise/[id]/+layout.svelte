<script lang="ts">
    import { loadedExercise } from "$lib/page-state";
    import { Separator } from "$lib/components/ui/separator";
    import UserMenu from "$lib/UserMenu.svelte";
    import type { LayoutData } from "./$types";

    export let data: LayoutData;

    $: $loadedExercise = data.exercise;
</script>

<div class="flex h-full flex-col">
    <div class="ml-16 flex content-around items-center p-2 md:ml-0">
        <span class="text-lg">{data.exercise.title}</span>
        <UserMenu />
    </div>
    <Separator class="mb-2" />

    <slot />
</div>
