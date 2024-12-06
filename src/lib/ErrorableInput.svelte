<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";

    interface Props {
        label: string;
        id: string;
        serverResp: { value: string; error?: string } | undefined;
        value?: string;
        [key: string]: any;
    }

    let { label, id, serverResp, value = undefined, ...rest }: Props = $props();
</script>

<div class="grid gap-2">
    <Label for={id}>{label}</Label>
    <Input
        {id}
        name={id}
        class={serverResp?.error ? "border-red-800" : ""}
        value={value ?? serverResp?.value}
        {...rest}
    />
    {#if serverResp && serverResp.error}
        <p class="text-sm text-red-500">{serverResp.error}</p>
    {/if}
</div>
