<script lang="ts">
    import UserMenu from "$lib/UserMenu.svelte";
    import * as m from "$lib/paraglide/messages";
</script>

<div class="flex h-full w-full flex-col">
    <div class="flex content-around items-center p-2">
        <a class="text-lg" href="/">{m.global_app_name()}</a>
        <UserMenu />
    </div>
    <slot />
</div>
