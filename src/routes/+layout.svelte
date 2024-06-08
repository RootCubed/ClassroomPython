<script lang="ts">
    import "../app.css";
    import { user } from "$lib/page-state";
    import type { LayoutData } from "./$types";

    export let data: LayoutData;

    if (data.user !== null) {
        $user = data.user;
    }
</script>

<div class="h-screen w-full">
    <slot />
</div>
