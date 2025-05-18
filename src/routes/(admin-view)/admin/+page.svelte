<script lang="ts">
    import type { ActionData, PageData } from "./$types";
    import { columns } from "./user-columns";
    import UserTable from "$lib/components/dataviews/DataTable.svelte";

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
        <UserTable data={data.users} {columns} />
    </div>
</div>
