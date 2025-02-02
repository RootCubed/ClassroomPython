<script lang="ts">
    import { page } from "$app/stores";
    import type { Snippet } from "svelte";

    import * as Sheet from "$lib/components/ui/sheet";
    import { Button } from "$lib/components/ui/button";
    import { Menu } from "lucide-svelte";

    import type { ExerciseGroupView } from "./page-types";
    import Sidebar from "./Sidebar.svelte";

    interface Props {
        exercises: ExerciseGroupView;
        children: Snippet;
    }

    let { exercises, children }: Props = $props();

    let popoverOpen = $state(false);

    $effect(() => {
        // User clicked on an exercise
        if ($page.url) {
            popoverOpen = false;
        }
    });
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
        <div class="absolute top-0 left-0 m-2 md:hidden">
            <Sheet.Root bind:open={popoverOpen}>
                <Sheet.Trigger>
                    {#snippet child({ props })}
                        <Button {...props} variant="ghost">
                            <Menu size={24} />
                        </Button>
                    {/snippet}
                </Sheet.Trigger>
                <Sheet.Content class="overflow-auto md:hidden" side="left">
                    <Sidebar {exercises} />
                </Sheet.Content>
            </Sheet.Root>
        </div>
    {/if}
    <div class="flex h-full flex-1 flex-col">
        {@render children()}
    </div>
</div>
