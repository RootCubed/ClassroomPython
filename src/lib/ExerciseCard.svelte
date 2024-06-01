<script lang="ts">
    import { Cog } from "lucide-svelte";
    import { cn } from "./utils";
    import type { Exercise } from "./clpy-types";
    import * as Tooltip from "./components/ui/tooltip";
    import { user } from "./page-state";

    export let exercise: Exercise;
    export let selected = false;
</script>

<a
    href="/exercise/{exercise.id}"
    class={cn(
        "relative flex min-h-20 flex-col items-start gap-2 rounded-lg border p-3 text-sm transition-all hover:bg-accent",
        selected && "bg-accent text-accent-foreground"
    )}
>
    <div class="flex w-full flex-col gap-1">
        <div class="flex items-center">
            <div class="flex items-center gap-2">
                <div class="font-semibold">
                    {exercise.title}
                </div>
            </div>
            <div class="ml-auto text-xs text-foreground">
                <Tooltip.Root>
                    <Tooltip.Trigger>
                        <span class="flex h-2 w-2 rounded-full bg-yellow-600" />
                    </Tooltip.Trigger>
                    <Tooltip.Content>Noch nicht abgegeben</Tooltip.Content>
                </Tooltip.Root>
            </div>
        </div>
        <div class="text-xs font-medium">{exercise.subtitle ?? " "}</div>
    </div>
    <div class="line-clamp-2 text-xs text-muted-foreground">{exercise.description ?? ""}</div>
    {#if $user.isAdmin}
        <a class="absolute bottom-3 right-3" href="/exercise/{exercise.id}/admin">
            <Cog size={16} />
        </a>
    {/if}
</a>
