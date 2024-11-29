<script lang="ts">
    import { Cog } from "lucide-svelte";
    import { cn } from "./utils";
    import type { ExerciseView } from "./page-types";
    import * as Tooltip from "./components/ui/tooltip";
    import { user } from "./page-state";
    import { Role } from "@prisma/client";
    import { page } from "$app/stores";

    export let exercise: Pick<ExerciseView, "id" | "title" | "subtitle" | "submissions">;
    export let selected = false;

    $: submissionStatus = exercise.submissions.length === 0 ? "not_submitted" : "submitted";
</script>

<div
    class={cn(
        "flex min-h-16 flex-row rounded-lg bg-zinc-100 transition-all hover:bg-opacity-75 dark:bg-zinc-800",
        selected && "bg-zinc-300 text-accent-foreground dark:bg-zinc-700"
        // exercise.submissionStatus == "submitted" && "bg-emerald-700"
    )}
>
    <a
        href="/course/{$page.params.courseID}/exercise/{exercise.id}"
        class="flex flex-grow flex-col items-start gap-1 border border-opacity-0 p-3 text-sm"
    >
        <div class="relative flex w-full items-center">
            <div class="flex items-center gap-2">
                <div class="font-semibold">
                    {exercise.title}
                </div>
            </div>
        </div>
        <div class="text-xs font-medium">{exercise.subtitle ?? " "}</div>
    </a>
    <div class="flex items-center gap-2 p-2">
        {#if $user.role != Role.STUDENT}
            <a href="/course/{$page.params.courseID}/exercise/{exercise.id}/admin">
                <Cog size={16} />
            </a>
        {:else if submissionStatus == "not_submitted" || submissionStatus == "submitted"}
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <span
                        class={cn(
                            "mr-2 flex h-2 w-2 rounded-full",
                            submissionStatus == "not_submitted" && "bg-yellow-600",
                            submissionStatus == "submitted" && "bg-green-600"
                        )}
                    ></span>
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
