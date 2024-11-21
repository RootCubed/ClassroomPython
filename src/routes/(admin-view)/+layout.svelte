<script lang="ts">
    import UserMenu from "$lib/UserMenu.svelte";
</script>

<div class="flex h-full w-full flex-col">
    <div class="flex content-around items-center p-2">
        <a class="text-lg" href="/">ClassroomPython</a>
        <UserMenu />
    </div>
    <slot />
</div>
