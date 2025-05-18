<script lang="ts">
    import { page } from "$app/stores";

    import { Role } from "@prisma/client";

    import * as Tooltip from "$lib/components/ui/tooltip";
    import { cn } from "$lib/utils";
    import { Cog } from "@lucide/svelte";

    import type { ExerciseView } from "./page-types";
    import { user } from "./page-state";

    import * as m from "$lib/paraglide/messages";

    interface Props {
        exercise: Pick<ExerciseView, "id" | "title" | "subtitle" | "submissions" | "testcases">;
        selected?: boolean;
    }

    let { exercise, selected = false }: Props = $props();

    let submissionStatus = $derived(
        exercise.submissions.length === 0 ? "not_submitted" : "submitted"
    );
    let missingSubmission = $derived(exercise.testcases.some((tc) => tc.testcaseResult == null));
    let correctSubmission = $derived(exercise.testcases.every((tc) => tc.testcaseResult?.passed));
</script>

<div
    class={cn(
        "hover:!bg-opacity-85 flex min-h-16 flex-row rounded-lg bg-zinc-100 transition-all dark:bg-zinc-800",
        selected && "text-accent-foreground bg-zinc-300 dark:bg-zinc-700",
        submissionStatus == "submitted" && "border-r-8",
        submissionStatus == "submitted" &&
            (missingSubmission
                ? "border-amber-300"
                : correctSubmission
                  ? "border-emerald-700"
                  : "border-rose-700")
    )}
>
    <a
        href="/course/{$page.params.courseID}/exercise/{exercise.id}"
        class="border-opacity-0 flex flex-grow flex-col items-start gap-1 border p-3 text-sm"
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
            <Tooltip.Provider>
                <Tooltip.Root>
                    <Tooltip.Trigger>
                        <span
                            class={cn(
                                "mr-2 flex h-2 w-2 rounded-full",
                                submissionStatus == "not_submitted" && "bg-yellow-600"
                            )}
                        ></span>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        {#if submissionStatus == "not_submitted"}
                            {m.course_home_not_submitted()}
                        {:else if submissionStatus == "submitted"}
                            {m.course_home_submitted()}
                        {/if}
                    </Tooltip.Content>
                </Tooltip.Root>
            </Tooltip.Provider>
        {/if}
    </div>
</div>
