<script lang="ts">
    import "../app.css";
    import { user } from "$lib/page-state";
    import type { LayoutData } from "./$types";
    import {
        setLanguageTag,
        onSetLanguageTag,
        type AvailableLanguageTag
    } from "$lib/paraglide/runtime";
    import { writable } from "svelte/store";

    export let data: LayoutData;

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
</script>

{#key $lang}
    <div class="h-screen w-full hyphens-auto">
        <slot />
    </div>
{/key}
