<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";

    import type { ActionData } from "./$types";
    import ErrorableInput from "$lib/ErrorableInput.svelte";

    export let form: ActionData;

    $: loginFail = computeLoginFail(form);

    function computeLoginFail(form: ActionData) {
        return {
            username: form?.username,
            password: form?.password
        };
    }
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
    <Card.Root class="mx-auto max-w-sm">
        <Card.Header>
            <Card.Title class="text-2xl">Login</Card.Title>
            <Card.Description>Gib deinen Benutzernamen ein, um fortzufahren.</Card.Description>
        </Card.Header>
        <Card.Content>
            <div class="grid w-full max-w-sm items-center gap-1.5">
                <form method="POST">
                    <div class="grid gap-4">
                        <ErrorableInput
                            label="Benutzername (vorname.nachname)"
                            error={loginFail.username}
                            id="username"
                            type="text"
                        />
                        <ErrorableInput
                            label="Passwort"
                            id="password"
                            type="password"
                            error={loginFail.password}
                        />
                        <Button type="submit" class="w-full">Login</Button>
                    </div>
                </form>
            </div>
        </Card.Content>
    </Card.Root>
</div>
