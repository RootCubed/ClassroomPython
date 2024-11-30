<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button } from "$lib/components/ui/button";
    import { ChevronDown, User } from "lucide-svelte";
    import { user } from "$lib/page-state";
    import { goto } from "$app/navigation";
    import { Role } from "@prisma/client";
</script>

<div class="ml-auto flex items-center">
    <DropdownMenu.Root>
        <DropdownMenu.Trigger
            tabindex={0}
            class="flex items-center gap-2 rounded-md bg-secondary p-2 text-sm hover:bg-secondary/80"
        >
            <User size={16} aria-label="User icon" />
            {$user.fullName}
            <ChevronDown class="h-4 w-4 text-secondary-foreground" aria-label="Dropdown Icon" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-40">
            <DropdownMenu.Label class="font-normal">
                <div class="flex flex-col space-y-1">
                    <p class="text-sm font-medium leading-none">{$user.fullName}</p>
                    <p class="text-xs leading-none text-muted-foreground">{$user.userName}</p>
                </div>
            </DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
                {#if $user.role === Role.ADMIN}
                    <DropdownMenu.Item on:click={() => goto("/admin")}
                        >Admin-Dashboard</DropdownMenu.Item
                    >
                {/if}
                {#if $user.role === Role.ADMIN || $user.role === Role.TEACHER}
                    <DropdownMenu.Item on:click={() => goto("/teacher-admin")}
                        >Lehrer-Dashboard</DropdownMenu.Item
                    >
                {/if}
                {#if $user.role === Role.STUDENT}
                    <DropdownMenu.Item on:click={() => goto("/")}>Meine Kurse</DropdownMenu.Item>
                {/if}
                <DropdownMenu.Separator />
            </DropdownMenu.Group>
            <DropdownMenu.Item on:click={() => (window.location.href = "/auth/logout")}
                >Ausloggen</DropdownMenu.Item
            >
        </DropdownMenu.Content>
    </DropdownMenu.Root>
</div>
