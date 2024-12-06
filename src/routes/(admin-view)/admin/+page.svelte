<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
    import { Label } from "$lib/components/ui/label";
    import * as Table from "$lib/components/ui/table";
    import { DoorOpen, PlusSquare, Trash } from "lucide-svelte";
    import type { ActionData, PageData } from "./$types";
    import { enhance } from "$app/forms";
    import ErrorableInput from "$lib/ErrorableInput.svelte";
    import { Input } from "$lib/components/ui/input";

    async function resetDatabase() {
        await fetch("/api/reset-database", { method: "POST" });
        invalidateAll();
    }

    interface Props {
        data: PageData;
        form: ActionData;
    }

    let { data, form }: Props = $props();

    let files: FileList | undefined = $state();
    let singleFile: FileList | undefined = $state();

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

    $effect(() => {
        if (files) {
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
    });

    $effect(() => {
        if (singleFile && singleFile[0]) {
            importExercise(singleFile[0]);
        }
    });
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
                        <Table.Head>Login as</Table.Head>
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
                                <form method="POST" action="/auth/loginas" use:enhance>
                                    <Input
                                        id="userId"
                                        name="userId"
                                        type="text"
                                        value={user.id}
                                        readonly
                                        class="hidden"
                                    />
                                    <Button type="submit" variant="secondary" class="p-2">
                                        <DoorOpen class="w-4" />
                                    </Button>
                                </form>
                            </Table.Cell>
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
                            <Label for="role">Rolle</Label>
                            <select
                                form="add-user-form"
                                id="role"
                                name="role"
                                class="my-2 rounded-md border border-input bg-background p-1.5 text-sm ring-offset-background"
                            >
                                <option value="STUDENT">Schüler</option>
                                <option value="TEACHER">Lehrer</option>
                                <option value="ADMIN">Admin</option>
                            </select>
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
                webkitdirectory={true}
            />
        </div>
    </div>
    <div class="space-y-2">
        <h3 class="text-xl font-bold">Datenbank zurücksetzen</h3>
        <Button variant="destructive" onclick={resetDatabase}>Datenbank zurücksetzen</Button>
    </div>
</div>
