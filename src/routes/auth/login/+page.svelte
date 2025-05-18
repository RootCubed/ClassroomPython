<script lang="ts">
    import type { ActionData } from "./$types";

    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { cn } from "$lib/utils";

    import ErrorableInput from "$lib/ErrorableInput.svelte";
    import LoginWithMicrosoftButton from "$lib/oauth/LoginWithMicrosoftButton.svelte";
    import { ArrowRight } from "@lucide/svelte";

    import * as m from "$lib/paraglide/messages";

    let { form }: { form: ActionData } = $props();

    let formDropdown = $state(false);
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-6 px-4">
    <h1 class="text-4xl font-bold">{m.global_app_name()}</h1>
    <Card.Root class="mx-auto max-w-sm">
        <Card.Header>
            <Card.Title class="text-2xl">{m.auth_login()}</Card.Title>
            <Card.Description>{m.auth_login_with_oidc()}</Card.Description>
        </Card.Header>
        <Card.Content>
            <div class="grid w-full max-w-sm items-center gap-1.5">
                <LoginWithMicrosoftButton />
                <div class="relative my-2">
                    <div class="absolute inset-0 flex items-center">
                        <span class="w-full border-t"></span>
                    </div>
                    <div class="relative flex justify-center text-xs uppercase">
                        <span class="bg-background text-muted-foreground px-2">
                            {m.auth_or_continue_with()}
                        </span>
                    </div>
                </div>

                <button
                    class="flex w-full items-center justify-between border-b py-2 text-left text-sm"
                    onclick={() => (formDropdown = !formDropdown)}
                >
                    {m.auth_login_username_password()}
                    <ArrowRight
                        size={18}
                        class={cn("transform transition-transform", formDropdown && "rotate-90")}
                    />
                </button>
                {#if formDropdown}
                    <form method="POST">
                        <div class="mt-2 grid gap-4">
                            <ErrorableInput
                                label={m.auth_username()}
                                serverResp={form?.username}
                                id="username"
                                type="text"
                            />
                            <ErrorableInput
                                label={m.auth_password()}
                                id="password"
                                type="password"
                                serverResp={form?.password}
                            />
                            <Button type="submit" class="w-full">{m.auth_login()}</Button>
                        </div>
                    </form>
                {/if}
            </div>
        </Card.Content>
    </Card.Root>
</div>
