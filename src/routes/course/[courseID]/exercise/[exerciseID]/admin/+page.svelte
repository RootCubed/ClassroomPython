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

    let openSubmission: (typeof data.exercise.submissions)[number] | undefined = $state();
    let submissionViewing = $state(false);
    $effect(() => {
        submissionViewing = openSubmission != undefined;
    });
</script>

<Dialog.Root bind:open={submissionViewing}>
    {#if openSubmission != undefined}
        <Dialog.Content class="flex h-[90vh] max-w-[90vw] flex-col">
            <Dialog.Header>
                <Dialog.Title
                    >{m.exadmin_submission_author({
                        name: openSubmission.user.userName
                    })}</Dialog.Title
                >
            </Dialog.Header>
            <CodeWindow
                exercise={{
                    ...data.exercise,
                    codeTemplate: openSubmission.code,
                    save: null
                }}
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
                        <Table.Cell><ChevronRight class="float-right" /></Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </Tabs.Content>
    <Tabs.Content value="edit" class="h-full overflow-auto">
        <CodeWindow
            exercise={{
                ...data.exercise,
                save: null
            }}
            exerciseURL="/course/{$page.params.courseID}/exercise/{data.exercise.id}"
            mode="EDIT"
        />
    </Tabs.Content>
</Tabs.Root>
