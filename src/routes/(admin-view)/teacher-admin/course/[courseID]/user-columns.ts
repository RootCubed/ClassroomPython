import { renderComponent } from "$lib/components/ui/data-table";
import type { ClientUser } from "$lib/server/auth";
import type { ColumnDef } from "@tanstack/table-core";
import UserAction from "./UserAction.svelte";
import { m } from "$lib/paraglide/messages";

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
        id: "actions",
        cell: ({ row }) => {
            return renderComponent(UserAction, { row: row.original });
        }
    }
];
