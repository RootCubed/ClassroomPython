<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<div class="h-full space-y-8 p-8">
    <div>
        <h2 class="text-2xl font-bold">Lehrer-Dashboard</h2>
        <p class="text-muted-foreground">Kursmanagement</p>
    </div>
    <div class="space-y-2">
        <h3 class="text-xl font-bold">Meine Kurse</h3>

        {JSON.stringify(data.courses)}
    </div>
</div>
