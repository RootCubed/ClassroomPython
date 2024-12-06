<script lang="ts">
    import type { PageData } from "./$types";

    import type { Snippet } from "svelte";

    import { Separator } from "$lib/components/ui/separator";

    import { loadedExercise } from "$lib/page-state";
    import SidebarLayout from "$lib/SidebarLayout.svelte";
    import UserMenu from "$lib/UserMenu.svelte";

    interface Props {
        data: PageData;
        children: Snippet;
    }

    let { data, children }: Props = $props();
</script>

<SidebarLayout exercises={data.exercises}>
    <div class="ml-16 flex content-around items-center p-2 md:ml-0">
        <span class="text-lg">
            {#if $loadedExercise}
                {$loadedExercise.title}
            {:else}
                Home
            {/if}
        </span>
        <UserMenu />
    </div>
    <Separator class="mb-2" />
    <div class="flex h-full min-h-0 flex-col">
        {@render children()}
    </div>
</SidebarLayout>
