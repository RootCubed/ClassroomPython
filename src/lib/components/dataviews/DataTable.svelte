<script lang="ts" generics="TData, TValue">
    import type { Snippet } from "svelte";
    import {
        type ColumnDef,
        type ColumnFiltersState,
        getCoreRowModel,
        getFilteredRowModel,
        getPaginationRowModel,
        type PaginationState
    } from "@tanstack/table-core";
    import { createSvelteTable, FlexRender } from "$lib/components/ui/data-table/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import { Input } from "$lib/components/ui/input";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import DataTablePagination from "./DataTablePagination.svelte";
    import { m } from "$lib/paraglide/messages";

    type DataTableProps<TData, TValue> = {
        columns: ColumnDef<TData, TValue>[];
        data: TData[];
        dialog?: string;
        createDialog?: Snippet<[{ dialogClose: () => void }]>;
    };

    let { data, columns, dialog, createDialog }: DataTableProps<TData, TValue> = $props();

    let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 8 });
    let columnFilters = $state<ColumnFiltersState>([]);

    let dialogOpen = $state(false);

    const table = createSvelteTable({
        get data() {
            return data;
        },
        columns,
        state: {
            get pagination() {
                return pagination;
            },
            get columnFilters() {
                return columnFilters;
            }
        },
        onPaginationChange: (updater) => {
            pagination = typeof updater == "function" ? updater(pagination) : updater;
        },
        onColumnFiltersChange: (updater) => {
            columnFilters = typeof updater == "function" ? updater(columnFilters) : updater;
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel()
    });
</script>

<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Content class="flex max-w-sm flex-col">
        <Dialog.Header>
            <Dialog.Title>{dialog}</Dialog.Title>
        </Dialog.Header>
        {#if createDialog}
            {@render createDialog({
                dialogClose: () => {
                    dialogOpen = false;
                }
            })}
        {/if}
    </Dialog.Content>
</Dialog.Root>

<div class="flex max-w-[800px] flex-col gap-4 py-4">
    <div class="flex justify-between">
        <Input
            placeholder="Filter names..."
            value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
            onchange={(e) => {
                table.getColumn("fullName")?.setFilterValue(e.currentTarget.value);
            }}
            oninput={(e) => {
                table.getColumn("fullName")?.setFilterValue(e.currentTarget.value);
            }}
            class="max-w-[300px]"
        />
        {#if dialog}
            <Button onclick={() => (dialogOpen = true)} onkeypress={() => (dialogOpen = true)}
                >{dialog}</Button
            >
        {/if}
    </div>
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
                            {m.table_no_results()}
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
    <DataTablePagination {table} {pagination} />
</div>
