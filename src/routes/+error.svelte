<script>
    import { page } from "$app/stores";
</script>

<div class="flex h-full flex-col items-center justify-center gap-2">
    <span class="text-2xl">An error occured.</span>
    <span>{$page.error?.message}</span>
</div>
