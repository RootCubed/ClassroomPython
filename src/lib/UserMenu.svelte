<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button } from "$lib/components/ui/button";
    import { ChevronDown, User } from "lucide-svelte";
    import { user } from "$lib/page-state";
</script>

<div class="ml-auto flex items-center">
    <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild let:builder>
            <Button builders={[builder]} variant="secondary" class="flex gap-2 px-2">
                <User size={16} />
                {$user.fullName}
                <ChevronDown class="text-secondary-foreground h-4 w-4" />
            </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-40">
            <DropdownMenu.Label class="font-normal">
                <div class="flex flex-col space-y-1">
                    <p class="text-sm font-medium leading-none">{$user.fullName}</p>
                    <p class="text-muted-foreground text-xs leading-none">{$user.name}</p>
                </div>
            </DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
                <DropdownMenu.Item>Profil</DropdownMenu.Item>
                <DropdownMenu.Item>Einstellungen</DropdownMenu.Item>
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Ausloggen</DropdownMenu.Item>
        </DropdownMenu.Content>
    </DropdownMenu.Root>
</div>
