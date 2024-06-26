<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion";
    import { Separator } from "$lib/components/ui/separator";
    import type { ExerciseGroupView } from "./server/db";
    import { loadedExercise } from "./page-state";
    import ExerciseCard from "./ExerciseCard.svelte";

    export let exercises: ExerciseGroupView;
</script>

<span class="block w-full p-2 text-xl font-semibold">Aufgaben</span>
<Separator class="mt-2" />
<Accordion.Root value={$loadedExercise?.exerciseGroup.id}>
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
