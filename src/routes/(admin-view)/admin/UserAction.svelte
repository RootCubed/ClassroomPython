<script lang="ts">
    import Ellipsis from "@lucide/svelte/icons/ellipsis";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import type { ClientUser } from "$lib/server/auth";
    import { goto, invalidateAll } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import { m } from "$lib/paraglide/messages";

    let { row }: { row: ClientUser } = $props();

    function loginAs() {
        goto(`/auth/loginas?id=${row.id}`);
    }

    async function resetPassword() {
        toast.warning("Feature not implemented yet");
    }

    async function deleteUser() {
        const resp = await fetch("?/deleteUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                id: row.id
            })
        });
        const json = await resp.json();
        if (json.type == "success") {
            invalidateAll();
        } else {
            toast.error("Failed to delete user: " + json.data);
        }
    }
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        {#snippet child({ props })}
            <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
                <span class="sr-only">Open menu</span>
                <Ellipsis />
            </Button>
        {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
            <DropdownMenu.GroupHeading>{m.admin_actions_group()}</DropdownMenu.GroupHeading>
            <DropdownMenu.Item class="mx-2" onclick={loginAs}>{m.admin_loginas()}</DropdownMenu.Item
            >
            <DropdownMenu.Item class="mx-2" onclick={resetPassword}
                >{m.admin_reset_password()}</DropdownMenu.Item
            >
            <DropdownMenu.Item class="mx-2" onclick={deleteUser}
                ><span class="text-red-500">{m.admin_delete_user()}</span></DropdownMenu.Item
            >
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root>
