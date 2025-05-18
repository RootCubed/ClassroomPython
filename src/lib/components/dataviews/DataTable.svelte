<script lang="ts" generics="TData, TValue">
    import {
        type ColumnDef,
        getCoreRowModel,
        getPaginationRowModel,
        type PaginationState
    } from "@tanstack/table-core";
    import { createSvelteTable, FlexRender } from "$lib/components/ui/data-table/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import DataTablePagination from "./DataTablePagination.svelte";

    type DataTableProps<TData, TValue> = {
        columns: ColumnDef<TData, TValue>[];
        data: TData[];
    };

    let { data, columns }: DataTableProps<TData, TValue> = $props();

    let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 8 });

    const table = createSvelteTable({
        get data() {
            return data;
        },
        columns,
        state: {
            get pagination() {
                return pagination;
            }
        },
        onPaginationChange: (updater) => {
            pagination = typeof updater == "function" ? updater(pagination) : updater;
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    });
</script>

<div class="flex max-w-[800px] flex-col gap-4 py-4">
    <div class="rounded-md border">
        <Table.Root>
            <Table.Header>
                {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
                    <Table.Row>
                        {#each headerGroup.headers as header (header.id)}
                            <Table.Head>
                                {#if !header.isPlaceholder}
                                    <FlexRender
                                        content={header.column.columnDef.header}
                                        context={header.getContext()}
                                    />
                                {/if}
                            </Table.Head>
                        {/each}
                    </Table.Row>
                {/each}
            </Table.Header>
            <Table.Body>
                {#each table.getRowModel().rows as row (row.id)}
                    <Table.Row>
                        {#each row.getVisibleCells() as cell (cell.id)}
                            <Table.Cell class="py-2">
                                <FlexRender
                                    content={cell.column.columnDef.cell}
                                    context={cell.getContext()}
                                />
                            </Table.Cell>
                        {/each}
                    </Table.Row>
                {:else}
                    <Table.Row>
                        <Table.Cell colspan={columns.length} class="h-24 text-center">
                            No results.
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
    <DataTablePagination {table} {pagination} />
</div>
