<script lang="ts">
    import { page } from "$app/stores";
    import { PUBLIC_MICROSOFT_CLIENT_ID } from "$env/static/public";
    import Button from "$lib/components/ui/button/button.svelte";
    import { SCOPE_REQUEST, OAUTH_ENDPOINT } from "./constants";

    let url = new URL(OAUTH_ENDPOINT + "/authorize");

    url.searchParams.append("client_id", PUBLIC_MICROSOFT_CLIENT_ID);
    url.searchParams.append("response_type", "code");
    url.searchParams.append("redirect_uri", $page.url.origin + "/auth/openid");
    url.searchParams.append("response_mode", "query");
    url.searchParams.append("scope", SCOPE_REQUEST);
    url.searchParams.append("nonce", "");
</script>

<a href={url.toString()}>
    <Button class="flex w-full gap-3">
        <img src="/ms_logo.svg" alt="Microsoft Logo" class="h-6 w-6" />
        Sign in with Microsoft
    </Button>
</a>
