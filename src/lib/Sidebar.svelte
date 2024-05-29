<script>
    import { AccordionItem, Accordion, Indicator, Card } from "flowbite-svelte";
    import { AngleRightOutline } from "flowbite-svelte-icons";

    const exampleData = [
        {
            title: "Kohn-Skript, Kap. 4.3",
            exercises: [
                {
                    title: "Aufgabe 12",
                    hasSolution: true,
                    solved: true
                },
                {
                    title: "Aufgabe 13",
                    hasSolution: false,
                    solved: false
                }
            ]
        },
        ...Array(20)
            .fill(null)
            .map((_) => ({
                title: "Kohn-Skript, Kap. 4.4",
                exercises: [
                    {
                        title: "Aufgabe 14",
                        hasSolution: true,
                        solved: false
                    },
                    {
                        title: "Aufgabe 15",
                        hasSolution: false,
                        solved: false
                    }
                ]
            }))
    ];
</script>

<div class="overflow-auto px-2">
    <Accordion flush>
        {#each exampleData as group}
            <AccordionItem>
                <span slot="header" class="flex w-full items-center justify-between pr-5">
                    {group.title}
                    <Indicator color="yellow" />
                </span>
                {#each group.exercises as exercise}
                    <button class="my-2 w-full">
                        <Card padding="sm" color={exercise.solved ? "green" : "default"}>
                            <div class="flex items-center justify-between">
                                <p>{exercise.title}</p>
                                <AngleRightOutline />
                            </div>
                        </Card>
                    </button>
                {/each}
            </AccordionItem>
        {/each}
    </Accordion>
</div>
