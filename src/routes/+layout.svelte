<script lang="ts">
    import "../app.css";

    import PyodideWorker from "$lib/pyodide.worker?worker";

    import { browser } from "$app/environment";
    import type { Snippet } from "svelte";
    import type { LayoutData } from "./$types";

    import { Toaster } from "svelte-sonner";

    import { user, pyodide, locale } from "$lib/page-state";
    import { WebWorkerPyodide } from "$lib/pyodide-mgr.svelte";
    import { getLocale } from "$lib/paraglide/runtime";

    interface Props {
        data: LayoutData;
        children: Snippet;
    }

    let { data, children }: Props = $props();

    if (data.user !== null) {
        $user = data.user;
    }

    $locale = getLocale();

    if (browser) {
        $pyodide = new WebWorkerPyodide(new PyodideWorker());
    }
</script>

<Toaster theme="dark" richColors duration={5000} closeButton={true} />
{#key $locale}
    <div class="h-screen w-full hyphens-auto">
        {@render children()}
    </div>
{/key}
