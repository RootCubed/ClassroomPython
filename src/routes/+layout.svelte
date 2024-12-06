<script lang="ts">
    import "../app.css";

    import PyodideWorker from "$lib/pyodide.worker?worker";

    import { browser } from "$app/environment";
    import type { Snippet } from "svelte";
    import { writable } from "svelte/store";
    import type { LayoutData } from "./$types";

    import { Toaster } from "svelte-sonner";

    import { user, pyodide } from "$lib/page-state";
    import { Pyodide } from "$lib/pyodide-mgr.svelte";

    import {
        onSetLanguageTag,
        setLanguageTag,
        type AvailableLanguageTag
    } from "$lib/paraglide/runtime";

    interface Props {
        data: LayoutData;
        children: Snippet;
    }

    let { data, children }: Props = $props();

    if (data.user !== null) {
        $user = data.user;
    }

    export const lang = writable<AvailableLanguageTag>("de-ch", (set) => {
        onSetLanguageTag((l) => {
            set(l);
        });
    });

    lang.subscribe((l) => {
        setLanguageTag(l);
    });

    if (browser) {
        $pyodide = new Pyodide(new PyodideWorker());
    }
</script>

<Toaster theme="dark" richColors duration={6000} />
{#key $lang}
    <div class="h-screen w-full hyphens-auto">
        {@render children()}
    </div>
{/key}
