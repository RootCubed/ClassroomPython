<script lang="ts">
    import "../app.css";

    import type { Snippet } from "svelte";
    import { writable } from "svelte/store";
    import type { LayoutData } from "./$types";

    import { user } from "$lib/page-state";
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
</script>

{#key $lang}
    <div class="h-screen w-full hyphens-auto">
        {@render children()}
    </div>
{/key}
