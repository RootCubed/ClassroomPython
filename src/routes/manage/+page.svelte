<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
    import { Label } from "$lib/components/ui/label";
    import * as Table from "$lib/components/ui/table";
    import type { PageData } from "./$types";

    async function resetDatabase() {
        await fetch("/api/reset-database", { method: "POST" });
        invalidateAll();
    }

    export let data: PageData;

    let files: FileList;

    $: if (files) {
        // TODO: clean this up
        (async () => {
            for (const file of files) {
                if (file.name == "users.json") {
                    const users = await file.text();
                    await fetch("/api/import-users", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: users
                    });
                } else if (file.name.includes(".py")) {
                    const lines = (await file.text()).replace(/\r/g, "").split("\n");
                    const meta: Record<string, string> = {};
                    const tryParse = (line: string, prefix: string, key: string) => {
                        if (line.startsWith(prefix)) {
                            meta[key] = line.slice(prefix.length);
                            return true;
                        }
                        return false;
                    };
                    const code = lines
                        .filter(
                            (line) =>
                                ![
                                    tryParse(line, "# TITLE: ", "title"),
                                    tryParse(line, "# SUBTITLE: ", "subtitle"),
                                    tryParse(line, "# CATEGORY: ", "groupName")
                                ].some((x) => x)
                        )
                        .join("\n");
                    await fetch("/api/import-exercise", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            meta,
                            code
                        })
                    });
                }
            }
        })();
    }

    /* The current Svelte version throws an error if these props are included directly */
    const directoryUploadProps = {
        webkitdirectory: true,
        mozdirectory: true
    };
</script>

<div class="h-full space-y-8 p-8">
    <div>
        <h2 class="text-2xl font-bold">Superadmin-Ansicht</h2>
        <p class="text-muted-foreground">Verwaltung der Datenbank</p>
    </div>
    <div class="space-y-2">
        <h3 class="text-xl font-bold">Benutzer</h3>
        {#if !data.users}
            <p>Keine Benutzer vorhanden</p>
        {:else}
            <Table.Root class="max-w-[600px]">
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Benutzername</Table.Head>
                        <Table.Head>Name</Table.Head>
                        <Table.Head>Admin?</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each data.users as user}
                        <Table.Row>
                            <Table.Cell>{user.name}</Table.Cell>
                            <Table.Cell>{user.fullName}</Table.Cell>
                            <Table.Cell>{user.isAdmin ? "Ja" : "Nein"}</Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        {/if}
    </div>
    <div class="space-y-2">
        <h3 class="text-xl font-bold">DB Upload</h3>
        <div class="grid max-w-sm items-center gap-1.5">
            <Label for="clpy-course-upload">Lade einen clpy_course-Order hoch:</Label>
            <!-- @ts-ignore -->
            <input
                class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium"
                bind:files
                id="clpy-course-upload"
                type="file"
                {...directoryUploadProps}
            />
        </div>
    </div>
    <div class="space-y-2">
        <h3 class="text-xl font-bold">Datenbank zurücksetzen</h3>
        <Button variant="destructive" on:click={resetDatabase}>Datenbank zurücksetzen</Button>
    </div>
</div>
