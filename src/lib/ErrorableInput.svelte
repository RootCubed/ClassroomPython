<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";

    export let label: string;
    export let id: string;
    export let serverResp: { value: string; error?: string } | undefined;
</script>

<div class="grid gap-2">
    <Label for={id}>{label}</Label>
    <Input
        {id}
        name={id}
        class={serverResp?.error ? "border-red-800" : ""}
        value={$$restProps["value"] ?? serverResp?.value}
        {...$$restProps}
    />
    {#if serverResp && serverResp.error}
        <p class="text-sm text-red-500">{serverResp.error}</p>
    {/if}
</div>
