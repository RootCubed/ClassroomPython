<script lang="ts">
    import * as Select from "$lib/components/ui/select";
    import { m } from "$lib/paraglide/messages";
    import type { Role } from "@prisma/client";

    let {
        id,
        role,
        onchange = () => {}
    }: { id: string; role: Role; onchange?: (role: Role) => void } = $props();

    let value = $state(role);

    const options = {
        STUDENT: m.global_role_student(),
        TEACHER: m.global_role_teacher(),
        ADMIN: m.global_role_admin()
    };

    const triggerContent = $derived(options[value] ?? m.global_role_prompt_select());
</script>

<Select.Root type="single" name="role" bind:value>
    <Select.Trigger class="w-[120px]">
        {triggerContent}
    </Select.Trigger>
    <Select.Content>
        <Select.Group>
            {#each Object.entries(options) as [v, label]}
                <Select.Item value={v} {label} onclick={() => onchange(value)}>
                    {label}
                </Select.Item>
            {/each}
        </Select.Group>
    </Select.Content>
</Select.Root>
