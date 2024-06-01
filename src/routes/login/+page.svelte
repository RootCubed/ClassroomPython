<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
    <Card.Root class="mx-auto max-w-sm">
        <Card.Header>
            <Card.Title class="text-2xl">Login</Card.Title>
            <Card.Description>Enter your email below to login to your account</Card.Description>
        </Card.Header>
        <Card.Content>
            <div class="grid w-full max-w-sm items-center gap-1.5">
                <form method="POST">
                    <div class="grid gap-4">
                        <div class="grid gap-2">
                            <Label for="username">Username</Label>
                            <Input name="username" type="text" placeholder="Username" />
                        </div>
                        <Button type="submit" class="w-full">Login</Button>
                    </div>
                </form>
            </div>
        </Card.Content>
    </Card.Root>
</div>
