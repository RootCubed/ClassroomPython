<script lang="ts">
    import type { ExerciseGroup } from "./clpy-types";
    import Sidebar from "./Sidebar.svelte";
    import * as Sheet from "$lib/components/ui/sheet";
    import { Menu } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";

    export let exercises: ExerciseGroup[];
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
            <Sheet.Root>
                <Sheet.Trigger>
                    <Button variant="ghost">
                        <Menu size={24} />
                    </Button>
                </Sheet.Trigger>
                <Sheet.Content side="left">
                    <Sidebar {exercises} />
                </Sheet.Content>
            </Sheet.Root>
        </div>
    {/if}
    <div class="flex-1">
        <slot></slot>
    </div>
</div>
