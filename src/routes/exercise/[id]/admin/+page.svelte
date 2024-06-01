<script lang="ts">
    import type { PageData } from "./$types";
    import type { Submission } from "$lib/clpy-types";
    import * as Tabs from "$lib/components/ui/tabs";
    import * as Table from "$lib/components/ui/table";
    import * as Dialog from "$lib/components/ui/dialog";
    import { ChevronRight } from "lucide-svelte";
    import CodeWindow from "$lib/CodeWindow.svelte";

    export let data: PageData;

    function formatTimestamp(timestamp: Date) {
        return new Date(timestamp).toLocaleString();
    }

    function submissionLink(submission: Submission) {
        return `/admin/submission/${submission.id}`;
    }

    let openSubmission: Submission | undefined;
</script>

<Dialog.Root open={openSubmission !== undefined}>
    {#if openSubmission !== undefined}
        <Dialog.Content class="flex h-[90vh] max-w-[90vw] flex-col">
            <Dialog.Header>
                <Dialog.Title>Viewing submission by {openSubmission.user.name}</Dialog.Title>
            </Dialog.Header>
            <CodeWindow initialCode={openSubmission.code} />
        </Dialog.Content>
    {/if}
</Dialog.Root>

<Tabs.Root class="flex h-full min-h-0 flex-col overflow-auto p-2">
    <Tabs.List class="grid w-full grid-cols-2">
        <Tabs.Trigger value="submissions">Submissions</Tabs.Trigger>
        <Tabs.Trigger value="edit">Edit</Tabs.Trigger>
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
                    <div
                        on:click={() => (openSubmission = submission)}
                        on:keypress={() => (openSubmission = submission)}
                        class="contents"
                        aria-label="Open submission"
                        role="button"
                        tabindex={i}
                    >
                        <Table.Row>
                            <Table.Cell>{submission.user.name}</Table.Cell>
                            <Table.Cell>{formatTimestamp(submission.timestamp)}</Table.Cell>
                            <Table.Cell><ChevronRight class="float-right" /></Table.Cell>
                        </Table.Row>
                    </div>
                {/each}
            </Table.Body>
        </Table.Root>
    </Tabs.Content>
    <Tabs.Content value="edit" class="h-full overflow-auto">Edit</Tabs.Content>
</Tabs.Root>
