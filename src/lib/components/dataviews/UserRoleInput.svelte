<script lang="ts">
    import * as Select from "$lib/components/ui/select";
    import { m } from "$lib/paraglide/messages";
    import { Role } from "@prisma/client";

    let {
        role = Role.STUDENT,
        name = "role",
        onchange = () => {}
    }: { role?: Role; onchange?: (role: Role) => void; name?: string } = $props();

    const options = {
        STUDENT: m.global_role_student(),
        TEACHER: m.global_role_teacher(),
        ADMIN: m.global_role_admin()
    };

    const triggerContent = $derived(options[role] ?? m.global_role_prompt_select());
</script>

<Select.Root type="single" {name} value={role}>
    <Select.Trigger class="w-[120px]">
        {triggerContent}
    </Select.Trigger>
    <Select.Content>
        <Select.Group>
            {#each Object.values(Role) as r}
                <Select.Item
                    value={r}
                    onclick={() => {
                        role = r;
                        onchange(role);
                    }}
                >
                    {options[r]}
                </Select.Item>
            {/each}
        </Select.Group>
    </Select.Content>
</Select.Root>
