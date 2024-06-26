<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button } from "$lib/components/ui/button";
    import { ChevronDown, User } from "lucide-svelte";
    import { user } from "$lib/page-state";
    import { goto } from "$app/navigation";
</script>

<div class="ml-auto flex items-center">
    <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild let:builder>
            <Button builders={[builder]} variant="secondary" class="flex gap-2 px-2">
                <User size={16} />
                {$user.fullName}
                <ChevronDown class="h-4 w-4 text-secondary-foreground" />
            </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-40">
            <DropdownMenu.Label class="font-normal">
                <div class="flex flex-col space-y-1">
                    <p class="text-sm font-medium leading-none">{$user.fullName}</p>
                    <p class="text-xs leading-none text-muted-foreground">{$user.userName}</p>
                </div>
            </DropdownMenu.Label>
            <DropdownMenu.Separator />
            <!-- <DropdownMenu.Group>
                <DropdownMenu.Item>Profil</DropdownMenu.Item>
                <DropdownMenu.Item>Einstellungen</DropdownMenu.Item>
            </DropdownMenu.Group>
            <DropdownMenu.Separator /> -->
            <DropdownMenu.Item on:click={() => goto("/logout")}>Ausloggen</DropdownMenu.Item>
        </DropdownMenu.Content>
    </DropdownMenu.Root>
</div>
