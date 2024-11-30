<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";

    import type { ActionData } from "./$types";
    import ErrorableInput from "$lib/ErrorableInput.svelte";
    import LoginWithMicrosoftButton from "$lib/oauth/LoginWithMicrosoftButton.svelte";
    import { ArrowRight } from "lucide-svelte";
    import { cn } from "$lib/utils";

    export let form: ActionData;

    let formDropdown = false;
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-6 px-4">
    <h1 class="text-4xl font-bold">ClassroomPython</h1>
    <Card.Root class="mx-auto max-w-sm">
        <Card.Header>
            <Card.Title class="text-2xl">Login</Card.Title>
            <Card.Description
                >Melde dich mit deinem Schulkonto an, um fortzufahren.</Card.Description
            >
        </Card.Header>
        <Card.Content>
            <div class="grid w-full max-w-sm items-center gap-1.5">
                <LoginWithMicrosoftButton />
                <div class="relative my-2">
                    <div class="absolute inset-0 flex items-center">
                        <span class="w-full border-t"></span>
                    </div>
                    <div class="relative flex justify-center text-xs uppercase">
                        <span class="bg-background px-2 text-muted-foreground">
                            Oder weiter mit
                        </span>
                    </div>
                </div>

                <button
                    class="flex w-full items-center justify-between border-b py-2 text-left text-sm"
                    on:click={() => (formDropdown = !formDropdown)}
                >
                    Login mit Benutzername & Passwort
                    <ArrowRight
                        size={18}
                        class={cn("transform transition-transform", formDropdown && "rotate-90")}
                    />
                </button>
                {#if formDropdown}
                    <form method="POST">
                        <div class="mt-2 grid gap-4">
                            <ErrorableInput
                                label="Benutzername"
                                serverResp={form?.username}
                                id="username"
                                type="text"
                            />
                            <ErrorableInput
                                label="Passwort"
                                id="password"
                                type="password"
                                serverResp={form?.password}
                            />
                            <Button type="submit" class="w-full">Login</Button>
                        </div>
                    </form>
                {/if}
            </div>
        </Card.Content>
    </Card.Root>
</div>
