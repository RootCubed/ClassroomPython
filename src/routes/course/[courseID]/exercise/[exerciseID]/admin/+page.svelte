<script lang="ts">
    import type { PageData } from "./$types";

    import { page } from "$app/stores";

    import * as Tabs from "$lib/components/ui/tabs";
    import * as Table from "$lib/components/ui/table";
    import * as Dialog from "$lib/components/ui/dialog";
    import { ChevronRight } from "lucide-svelte";

    import CodeWindow from "$lib/CodeWindow.svelte";

    import * as m from "$lib/paraglide/messages";

    let { data }: { data: PageData } = $props();

    function formatTimestamp(timestamp: Date) {
        return new Date(timestamp).toLocaleString("de-CH");
    }

    let openSubmission: (typeof data.exercise.submissions)[number] | null = $state(null);
    let submissionViewing = $state(false);
    $effect(() => {
        submissionViewing = openSubmission != null;
    });

    let openSubExercise = $derived.by(() => {
        if (openSubmission == null) {
            return null;
        }
        const sub = openSubmission;
        return {
            ...data.exercise,
            codeTemplate: sub.code,
            save: null,
            testcases: data.exercise.testcases.map((testcase) => ({
                ...testcase,
                testcaseResult:
                    sub.results.find(
                        (result) => result.testcaseId == testcase.id && result.userId == sub.user.id
                    ) ?? null
            }))
        };
    });
</script>

{#snippet submissionScore(submission: Exclude<typeof openSubmission, null>)}
    {#if submission.results.length == 0}
        <span class="text-gray-500">(Old submission)</span>
    {:else}
        {@const score = submission.results.reduce(
            (acc, result) => acc + (result.passed ? 1 : 0),
            0
        )}
        <span class={score == submission.results.length ? "text-green-500" : "text-red-500"}>
            {score}/{submission.results.length}
        </span>
    {/if}
{/snippet}

<Dialog.Root bind:open={submissionViewing}>
    {#if openSubmission != null && openSubExercise != null}
        <Dialog.Content class="flex h-[90vh] max-w-[90vw] flex-col">
            <Dialog.Header>
                <Dialog.Title
                    >{m.exadmin_submission_author({
                        name: openSubmission.user.userName
                    })}</Dialog.Title
                >
            </Dialog.Header>
            <CodeWindow
                exercise={openSubExercise}
                exerciseURL="/course/{$page.params.courseID}/exercise/{data.exercise.id}"
                mode="SUBMISSION_VIEW"
                submitAs={openSubmission.user.id}
            />
        </Dialog.Content>
    {/if}
</Dialog.Root>

<Tabs.Root class="flex h-full min-h-0 flex-col overflow-auto p-2" value="submissions">
    <Tabs.List class="grid w-full grid-cols-2">
        <Tabs.Trigger value="submissions">{m.exadmin_tab_submissions()}</Tabs.Trigger>
        <Tabs.Trigger value="edit">{m.exadmin_tab_edit()}</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="submissions" class="h-full overflow-auto">
        <Table.Root>
            <Table.Header>
                <Table.Row>
                    <Table.Head>User</Table.Head>
                    <Table.Head>Time</Table.Head>
                    <Table.Head></Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each data.exercise.submissions as submission, i}
                    <Table.Row
                        onclick={() => (openSubmission = submission)}
                        onkeypress={() => (openSubmission = submission)}
                        aria-label="Open submission"
                        role="button"
                        tabindex={i}
                    >
                        <Table.Cell>{submission.user.userName}</Table.Cell>
                        <Table.Cell>{formatTimestamp(submission.timestamp)}</Table.Cell>
                        <Table.Cell>{@render submissionScore(submission)}</Table.Cell>
                        <Table.Cell><ChevronRight class="float-right" /></Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </Tabs.Content>
    <Tabs.Content value="edit" class="h-full overflow-auto">
        {#key $page.url}
            <CodeWindow
                exercise={{
                    ...data.exercise,
                    save: null
                }}
                exerciseURL="/course/{$page.params.courseID}/exercise/{data.exercise.id}"
                mode="EDIT"
            />
        {/key}
    </Tabs.Content>
</Tabs.Root>
