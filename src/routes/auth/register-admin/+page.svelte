<script lang="ts">
    import type { ActionData } from "./$types";

    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import ErrorableInput from "$lib/ErrorableInput.svelte";

    import * as m from "$lib/paraglide/messages";

    let { form }: { form: ActionData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
    <Card.Root class="mx-auto max-w-sm">
        <Card.Header>
            <Card.Title class="text-2xl">{m.auth_welcome_message()}</Card.Title>
            <Card.Description>{m.auth_create_admin()}</Card.Description>
        </Card.Header>
        <Card.Content>
            <div class="grid w-full max-w-sm items-center gap-1.5">
                <form method="POST">
                    <div class="grid gap-4">
                        <ErrorableInput
                            label={m.auth_full_name()}
                            serverResp={form?.fullName}
                            id="fullname"
                            type="text"
                        />
                        <ErrorableInput
                            label={m.auth_username()}
                            serverResp={form?.username}
                            id="username"
                            type="text"
                        />
                        <ErrorableInput
                            label={m.auth_password()}
                            serverResp={form?.password}
                            id="password"
                            type="password"
                        />
                        <Button type="submit" class="w-full">{m.auth_button_create_admin()}</Button>
                    </div>
                </form>
            </div>
        </Card.Content>
    </Card.Root>
</div>
