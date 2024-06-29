<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";

    export let label: string;
    export let id: string;
    export let error: { value: string; error: string } | undefined;
</script>

<div class="grid gap-2">
    <Label for={id}>{label}</Label>
    <Input
        {id}
        name={id}
        class={error ? "border-red-800" : ""}
        value={$$restProps["value"] ?? error?.value ?? undefined}
        {...$$restProps}
    />
    {#if error}
        <p class="text-sm text-red-500">{error.error}</p>
    {/if}
</div>
