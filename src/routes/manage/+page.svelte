<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";

    async function resetDatabase() {
        await fetch("/api/reset-database", { method: "POST" });
        invalidateAll();
    }
</script>

<div class="flex h-full flex-col items-center justify-center">
    <span class="select-none">(ADMIN VIEW)</span>

    <Button on:click={resetDatabase} color="red" class="ml-2">Reset Database</Button>
</div>
