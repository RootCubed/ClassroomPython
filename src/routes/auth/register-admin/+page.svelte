<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";

    import type { ActionData } from "./$types";

    export let form: ActionData;

    $: loginFail = computeLoginFail(form);

    function computeLoginFail(form: ActionData) {
        return {
            fullName: form?.fullName,
            username: form?.username,
            password: form?.password
        };
    }
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
    <Card.Root class="mx-auto max-w-sm">
        <Card.Header>
            <Card.Title class="text-2xl">Welcome to ClassroomPython!</Card.Title>
            <Card.Description>Please create an admin user.</Card.Description>
        </Card.Header>
        <Card.Content>
            <div class="grid w-full max-w-sm items-center gap-1.5">
                <form method="POST">
                    <div class="grid gap-4">
                        <div class="grid gap-2">
                            <Label for="fullname">Name</Label>
                            <div>
                                <Input
                                    class={loginFail.fullName ? "border-red-800" : ""}
                                    value={loginFail.fullName?.value ?? ""}
                                    id="fullname"
                                    name="fullname"
                                    type="text"
                                />
                                {#if loginFail.fullName}
                                    <p class="text-sm text-red-500">{loginFail.fullName.error}</p>
                                {/if}
                            </div>
                            <Label for="username">Benutzername (vorname.nachname)</Label>
                            <div>
                                <Input
                                    class={loginFail.username ? "border-red-800" : ""}
                                    value={loginFail.username?.value ?? ""}
                                    id="username"
                                    name="username"
                                    type="text"
                                />
                                {#if loginFail.username}
                                    <p class="text-sm text-red-500">{loginFail.username.error}</p>
                                {/if}
                            </div>
                            <Label for="password">Passwort</Label>
                            <div>
                                <Input
                                    class={loginFail.password ? "border-red-800" : ""}
                                    id="password"
                                    name="password"
                                    type="password"
                                />
                                {#if loginFail.password}
                                    <p class="text-sm text-red-500">{loginFail.password.error}</p>
                                {/if}
                            </div>
                        </div>
                        <Button type="submit" class="w-full">Create</Button>
                    </div>
                </form>
            </div>
        </Card.Content>
    </Card.Root>
</div>
