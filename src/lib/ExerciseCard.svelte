<script lang="ts">
    import { Cog } from "lucide-svelte";
    import { cn } from "./utils";
    import type { ExerciseView } from "./page-types";
    import * as Tooltip from "./components/ui/tooltip";
    import { user } from "./page-state";
    import { Role } from "@prisma/client";
    import { page } from "$app/stores";

    export let exercise: ExerciseView;
    export let selected = false;

    $: submissionStatus = exercise.submissions.length === 0 ? "not_submitted" : "submitted";
</script>

<a
    href="/course/{$page.params.courseID}/exercise/{exercise.id}"
    class={cn(
        "relative flex min-h-20 flex-col items-start gap-2 rounded-lg border p-3 text-sm transition-all hover:bg-accent",
        selected && "bg-accent text-accent-foreground"
        // exercise.submissionStatus == "submitted" && "bg-emerald-700"
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
                {#if submissionStatus == "not_submitted" || submissionStatus == "submitted"}
                    <Tooltip.Root>
                        <Tooltip.Trigger>
                            <span
                                class={cn(
                                    "flex h-2 w-2 rounded-full",
                                    submissionStatus == "not_submitted" && "bg-yellow-600",
                                    submissionStatus == "submitted" && "bg-green-600"
                                )}
                            />
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            {#if submissionStatus == "not_submitted"}
                                Noch nicht abgegeben
                            {:else if submissionStatus == "submitted"}
                                Abgegeben
                            {/if}
                        </Tooltip.Content>
                    </Tooltip.Root>
                {/if}
            </div>
        </div>
        <div class="text-xs font-medium">{exercise.subtitle ?? " "}</div>
    </div>
    <div class="line-clamp-2 text-xs text-muted-foreground">{exercise.description ?? ""}</div>
    {#if $user.role === Role.ADMIN}
        <a
            class="absolute bottom-3 right-3"
            href="/course/{$page.params.courseID}/exercise/{exercise.id}/admin"
        >
            <Cog size={16} />
        </a>
    {/if}
</a>
