<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";

    import type { ActionData } from "./$types";

    export let form: ActionData;

    $: loginFail = computeLoginFail(form);

    function computeLoginFail(form: ActionData) {
        if (form === null) return { username: null };
        return {
            username: form.username
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
                        <div class="grid gap-2">
                            <Label for="username">Benutzername</Label>
                            <div>
                                <Input
                                    class={loginFail.username ? "border-red-800" : ""}
                                    value={loginFail?.username?.value ?? ""}
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="vorname.nachname"
                                />
                                {#if loginFail.username}
                                    <p class="text-sm text-red-500">{loginFail.username.error}</p>
                                {/if}
                            </div>
                        </div>
                        <Button type="submit" class="w-full">Login</Button>
                    </div>
                </form>
            </div>
        </Card.Content>
    </Card.Root>
</div>
