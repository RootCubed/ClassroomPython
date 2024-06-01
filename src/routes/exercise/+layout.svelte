<script lang="ts">
    import type { PageData } from "./$types";
    import SidebarLayout from "$lib/SidebarLayout.svelte";
    import { Separator } from "$lib/components/ui/separator";
    import UserMenu from "$lib/UserMenu.svelte";
    import { loadedExercise } from "$lib/page-state";
    import { page } from "$app/stores";

    export let data: PageData;
</script>

<SidebarLayout exercises={data.exercises}>
    <div class="ml-16 flex content-around items-center p-2 md:ml-0">
        <span class="text-lg">
            {#if $page.params.id && $loadedExercise}
                {$loadedExercise.title}
            {:else}
                Home
            {/if}
        </span>
        <UserMenu />
    </div>
    <Separator class="mb-2" />
    <div class="flex h-full min-h-0 flex-col">
        <slot></slot>
    </div>
</SidebarLayout>
