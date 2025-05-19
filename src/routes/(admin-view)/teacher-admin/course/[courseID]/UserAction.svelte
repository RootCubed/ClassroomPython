<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import type { ClientUser } from "$lib/server/auth";
    import { invalidateAll } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import { m } from "$lib/paraglide/messages";
    import { UserMinus } from "@lucide/svelte";

    let { row }: { row: ClientUser } = $props();

    async function removeFromCourse() {
        const resp = await fetch("?/removeFromCourse", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                id: row.id
            })
        });
        const json = await resp.json();
        if (json.type == "success") {
            invalidateAll();
        } else {
            toast.error("Failed to remove user from course: " + json.data);
        }
    }
</script>

<div class="flex justify-around gap-2">
    <Button variant="secondary" size="icon" class="relative size-8 p-0" onclick={removeFromCourse}>
        <span class="sr-only">{m.teacher_admin_cm_remove_user()}</span>
        <UserMinus />
    </Button>
</div>
