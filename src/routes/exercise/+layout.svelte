<script lang="ts">
    import SidebarLayout from "$lib/SidebarLayout.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<SidebarLayout exercises={data.exercises}>
    <slot></slot>
</SidebarLayout>
