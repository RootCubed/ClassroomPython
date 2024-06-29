<script lang="ts">
    import type { ExerciseGroupView } from "$lib/page-types";
    import Sidebar from "./Sidebar.svelte";
    import * as Sheet from "$lib/components/ui/sheet";
    import { Menu } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import { page } from "$app/stores";

    export let exercises: ExerciseGroupView;

    let popoverOpen = false;

    $: if ($page.url) {
        // User clicked on an exercise
        popoverOpen = false;
    }
</script>

<div class="flex h-full w-full">
    {#if !exercises}
        <div class="flex h-full flex-col items-center justify-center">
            <span class="mt-2 select-none">Lädt...</span>
        </div>
    {:else}
        <div class="hidden w-[300px] overflow-auto border-r-2 p-2 md:block">
            <Sidebar {exercises} />
        </div>
        <div class="absolute left-0 top-0 m-2 md:hidden">
            <Sheet.Root bind:open={popoverOpen}>
                <Sheet.Trigger>
                    <Button variant="ghost" on:click={() => (popoverOpen = true)}>
                        <Menu size={24} />
                    </Button>
                </Sheet.Trigger>
                <Sheet.Portal class="md:hidden">
                    <Sheet.Content side="left">
                        <Sidebar {exercises} />
                    </Sheet.Content>
                </Sheet.Portal>
            </Sheet.Root>
        </div>
    {/if}
    <div class="flex h-full flex-1 flex-col">
        <slot></slot>
    </div>
</div>
