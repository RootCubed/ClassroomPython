import { renderComponent } from "$lib/components/ui/data-table";
import type { ClientUser } from "$lib/server/auth";
import type { ColumnDef } from "@tanstack/table-core";
import UserRole from "$lib/components/dataviews/UserRoleInput.svelte";
import UserAction from "./UserAction.svelte";
import { toast } from "svelte-sonner";
import { invalidateAll } from "$app/navigation";
import type { Role } from "@prisma/client";
import { m } from "$lib/paraglide/messages";

async function updateRole(id: string, role: Role) {
    const resp = await fetch("?/changeRole", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            id,
            role
        })
    });
    const json = await resp.json();
    if (json.type != "success") {
        invalidateAll();
        toast.error("Failed to update role: " + json.data);
    }
}

export const columns: ColumnDef<ClientUser>[] = [
    {
        accessorKey: "fullName",
        header: m.global_user_full_name
    },
    {
        accessorKey: "userName",
        header: m.global_user_username
    },
    {
        accessorKey: "role",
        header: m.global_user_role,
        cell: ({ row }) => {
            return renderComponent(UserRole, {
                role: row.original.role,
                onchange: (newRole) => updateRole(row.original.id, newRole)
            });
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return renderComponent(UserAction, { row: row.original });
        }
    }
];
