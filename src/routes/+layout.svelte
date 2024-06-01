<script lang="ts">
    import "../app.css";
    import { user } from "$lib/page-state";
    import type { LayoutData } from "./$types";
    import { redirect } from "@sveltejs/kit";
    import { page } from "$app/stores";

    export let data: LayoutData;

    if (data.user === null) {
        if ($page.url.pathname !== "/login" && $page.url.pathname !== "/manage") {
            redirect(307, "/login");
        }
    } else {
        $user = data.user;
    }
</script>

<div class="h-screen w-full">
    <slot />
</div>
