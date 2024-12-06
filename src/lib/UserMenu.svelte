<script lang="ts">
    import { goto } from "$app/navigation";

    import { Role } from "@prisma/client";

    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { cn } from "$lib/utils";
    import { ChevronDown, User } from "lucide-svelte";

    import { user } from "./page-state";

    import { setLanguageTag, languageTag, type AvailableLanguageTag } from "./paraglide/runtime";
    import * as m from "$lib/paraglide/messages";

    let currLang = $state(languageTag());
    $effect(() => setLanguageTag(currLang));

    const langs: { tag: AvailableLanguageTag; sym: string }[] = [
        { tag: "en", sym: "🇬🇧" },
        { tag: "de-ch", sym: "🇩🇪" }
    ];
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
                    <DropdownMenu.Item onclick={() => goto("/admin")}
                        >{m.menu_admin_dashboard()}</DropdownMenu.Item
                    >
                {/if}
                {#if $user.role === Role.ADMIN || $user.role === Role.TEACHER}
                    <DropdownMenu.Item onclick={() => goto("/teacher-admin")}
                        >{m.menu_teacher_dashboard()}</DropdownMenu.Item
                    >
                {/if}
                {#if $user.role === Role.STUDENT}
                    <DropdownMenu.Item onclick={() => goto("/")}
                        >{m.menu_my_courses()}</DropdownMenu.Item
                    >
                {/if}
                <DropdownMenu.Separator />
            </DropdownMenu.Group>
            <DropdownMenu.Group>
                <DropdownMenu.Label>{m.menu_language()}</DropdownMenu.Label>
                <div class="flex items-center justify-evenly gap-2">
                    {#each langs as { tag, sym }}
                        <button
                            class={cn(
                                "flex items-center rounded-sm px-4 py-1 hover:bg-zinc-800",
                                currLang == tag && "bg-zinc-800"
                            )}
                            onclick={() => {
                                currLang = tag;
                                document.documentElement.lang = tag;
                            }}
                        >
                            <span>{sym}</span>
                        </button>
                    {/each}
                </div>
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onclick={() => (window.location.href = "/auth/logout")}
                >{m.auth_logout()}</DropdownMenu.Item
            >
        </DropdownMenu.Content>
    </DropdownMenu.Root>
</div>
