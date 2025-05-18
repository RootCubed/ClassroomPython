<script lang="ts">
    import { page } from "$app/stores";

    import * as Accordion from "$lib/components/ui/accordion";
    import { Separator } from "$lib/components/ui/separator";
    import { CogIcon } from "@lucide/svelte";

    import type { ExerciseGroupView } from "./page-types";
    import { loadedExercise, user } from "./page-state";
    import ExerciseCard from "./ExerciseCard.svelte";

    import * as m from "$lib/paraglide/messages";

    let { exercises }: { exercises: ExerciseGroupView } = $props();
</script>

<div class="flex w-full items-center justify-between p-2">
    <span class="inline-block text-xl font-semibold">{m.home_exercises()}</span>
    {#if $user.role == "TEACHER" || $user.role == "ADMIN"}
        <a href="/teacher-admin/course/{$page.params.courseID}">
            <CogIcon size={20} />
        </a>
    {/if}
</div>
<Separator class="mt-2" />
<Accordion.Root value={$loadedExercise?.exerciseGroup.id} type="single">
    {#each exercises as group (group.id)}
        {#key group}
            <Accordion.Item value={group.id} class="text-sm">
                <Accordion.Trigger>
                    {group.title}
                </Accordion.Trigger>
                <Accordion.Content>
                    <div class="flex flex-col gap-2">
                        {#each group.exercises as exercise (exercise.id)}
                            <ExerciseCard
                                {exercise}
                                selected={$loadedExercise?.id === exercise.id}
                            />
                        {/each}
                    </div>
                </Accordion.Content>
            </Accordion.Item>
        {/key}
    {/each}
</Accordion.Root>
