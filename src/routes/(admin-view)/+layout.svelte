<script lang="ts">
    import type { Snippet } from "svelte";

    import UserMenu from "$lib/UserMenu.svelte";
    import * as m from "$lib/paraglide/messages";

    let { children }: { children: Snippet } = $props();
</script>

<div class="flex h-full w-full flex-col">
    <div class="flex content-around items-center p-2">
        <a class="text-lg" href="/">{m.global_app_name()}</a>
        <UserMenu />
    </div>
    {@render children()}
</div>
