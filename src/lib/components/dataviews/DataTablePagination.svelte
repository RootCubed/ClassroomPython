<script lang="ts" generics="TData">
    import { type Table, type PaginationState } from "@tanstack/table-core";
    import * as Pagination from "$lib/components/ui/pagination";
    import { ChevronLeft, ChevronRight } from "@lucide/svelte";

    let { table, pagination }: { table: Table<TData>; pagination: PaginationState } = $props();
</script>

<Pagination.Root count={table.getRowCount()} perPage={pagination.pageSize}>
    {#snippet children({ pages, currentPage })}
        <Pagination.Content>
            <Pagination.Item>
                <Pagination.PrevButton onclick={table.previousPage}>
                    <ChevronLeft class="size-4" />
                    <span class="hidden sm:block">Previous</span>
                </Pagination.PrevButton>
            </Pagination.Item>
            {#each pages as page (page.key)}
                {#if page.type == "ellipsis"}
                    <Pagination.Item>
                        <Pagination.Ellipsis />
                    </Pagination.Item>
                {:else}
                    <Pagination.Item onclick={() => table.setPageIndex(page.value - 1)}>
                        <Pagination.Link {page} isActive={currentPage == page.value}>
                            {page.value}
                        </Pagination.Link>
                    </Pagination.Item>
                {/if}
            {/each}
            <Pagination.Item>
                <Pagination.NextButton onclick={table.nextPage}>
                    <span class="hidden sm:block">Next</span>
                    <ChevronRight class="size-4" />
                </Pagination.NextButton>
            </Pagination.Item>
        </Pagination.Content>
    {/snippet}
</Pagination.Root>
