<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
    import { Label } from "$lib/components/ui/label";
    import * as Table from "$lib/components/ui/table";
    import { PlusSquare, Trash } from "lucide-svelte";
    import type { ActionData, PageData } from "./$types";
    import { enhance } from "$app/forms";
    import ErrorableInput from "$lib/ErrorableInput.svelte";
    import { Input } from "$lib/components/ui/input";

    async function resetDatabase() {
        await fetch("/api/reset-database", { method: "POST" });
        invalidateAll();
    }

    export let data: PageData;
    export let form: ActionData;

    let files: FileList;
    let singleFile: FileList;

    async function importExercise(file: File) {
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

    $: if (files) {
        (async () => {
            const codeFiles = [];
            let usersFile = null;
            for (const file of files) {
                if (file.name == "users.json") {
                    usersFile = await file.text();
                } else if (file.name.includes(".py")) {
                    codeFiles.push(file);
                }
            }
            for (const file of codeFiles) {
                await importExercise(file);
            }
            await fetch("/api/import-users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: usersFile
            });
        })();
    }

    $: if (singleFile && singleFile[0]) {
        console.log("File:", singleFile[0]);
        importExercise(singleFile[0]);
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
            <form id="add-user-form" method="POST" action="?/createUser" use:enhance></form>
            <Table.Root class="max-w-[600px]">
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Benutzername</Table.Head>
                        <Table.Head>Name</Table.Head>
                        <Table.Head>Benutzertyp</Table.Head>
                        <Table.Head></Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each data.users as user}
                        <Table.Row>
                            <Table.Cell>{user.userName}</Table.Cell>
                            <Table.Cell>{user.fullName}</Table.Cell>
                            <Table.Cell>{user.role}</Table.Cell>
                            <Table.Cell>
                                <form method="POST" action="?/deleteUser" use:enhance>
                                    <Input
                                        id="userId"
                                        name="userId"
                                        type="text"
                                        value={user.id}
                                        readonly
                                        class="hidden"
                                    />
                                    <Button type="submit" variant="destructive" class="p-2">
                                        <Trash class="w-4" />
                                    </Button>
                                </form>
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                    <Table.Row>
                        <Table.Cell>
                            <ErrorableInput
                                form="add-user-form"
                                label="Benutzername"
                                id="username"
                                type="text"
                                serverResp={undefined}
                            />
                        </Table.Cell>
                        <Table.Cell>
                            <ErrorableInput
                                form="add-user-form"
                                label="Name"
                                id="fullname"
                                type="text"
                                serverResp={form?.fullName}
                            />
                        </Table.Cell>
                        <Table.Cell>
                            <ErrorableInput
                                form="add-user-form"
                                label="Benutzertyp"
                                id="role"
                                type="text"
                                value="STUDENT"
                                serverResp={undefined}
                                readonly
                                class="cursor-not-allowed bg-background text-gray-400"
                            />
                        </Table.Cell>
                        <Table.Cell>
                            <Button
                                type="submit"
                                form="add-user-form"
                                variant="default"
                                class="p-2"
                            >
                                <PlusSquare class="w-4" />
                            </Button>
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table.Root>
        {/if}
    </div>
    <div class="space-y-2">
        <h3 class="text-xl font-bold">Aufgabenupload</h3>
        <div class="grid max-w-sm items-center gap-1.5">
            <Label for="clpy-course-upload">Lade eine Python-Datei hoch:</Label>
            <input
                class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium"
                bind:files={singleFile}
                id="clpy-course-upload"
                type="file"
            />
        </div>
    </div>
    <div class="space-y-2">
        <h3 class="text-xl font-bold">DB Upload</h3>
        <div class="grid max-w-sm items-center gap-1.5">
            <Label for="clpy-course-upload">Lade einen clpy_course-Order hoch:</Label>
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
