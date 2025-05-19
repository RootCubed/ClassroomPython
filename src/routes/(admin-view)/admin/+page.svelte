<script lang="ts">
    import type { ActionData, PageData } from "./$types";
    import { Button } from "$lib/components/ui/button";
    import { Label } from "$lib/components/ui/label";
    import UserTable from "$lib/components/dataviews/DataTable.svelte";
    import { enhance } from "$app/forms";
    import ErrorableInput from "$lib/ErrorableInput.svelte";
    import UserRole from "$lib/components/dataviews/UserRoleInput.svelte";
    import { columns } from "./user-columns";
    import { m } from "$lib/paraglide/messages";

    interface Props {
        data: PageData;
        form: ActionData;
    }

    let { data, form }: Props = $props();
</script>

<div class="h-full space-y-8 p-8">
    <div>
        <h2 class="text-2xl font-bold">Superadmin-Ansicht</h2>
        <p class="text-muted-foreground">Verwaltung der Datenbank</p>
    </div>
    <div class="space-y-2">
        <h3 class="text-xl font-bold">Benutzer</h3>
        <UserTable data={data.users} {columns} dialog={m.admin_create_user()}>
            {#snippet createDialog({ dialogClose })}
                <div class="grid items-center gap-1.5">
                    <form method="POST" action="?/createUser" use:enhance onsubmit={dialogClose}>
                        <div class="grid gap-4">
                            <ErrorableInput
                                label="Name"
                                id="fullname"
                                type="text"
                                name="fullname"
                                serverResp={form?.fullName}
                            />
                            <ErrorableInput
                                label="E-Mail"
                                id="title"
                                type="text"
                                name="username"
                                serverResp={form?.username}
                            />
                            <div class="grid gap-2">
                                <Label for="role">Role</Label>
                                <UserRole name="role" />
                            </div>
                            <Button type="submit" class="w-full">Erstellen</Button>
                        </div>
                    </form>
                </div>
            {/snippet}
        </UserTable>
    </div>
</div>
