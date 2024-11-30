import pdb from "$lib/server/prisma-db";
import { PUBLIC_MICROSOFT_CLIENT_ID } from "$env/static/public";
import { MICROSOFT_CLIENT_SECRET } from "$env/static/private";
import { $Enums, type OAuth } from "@prisma/client";
import { SCOPE_REQUEST, OAUTH_ENDPOINT } from "./constants";

export async function requestToken(base_url: string, code: string): Promise<OAuth | null> {
    const tokenURL = new URL(OAUTH_ENDPOINT + "/token");

    const tokenParams = {
        client_id: PUBLIC_MICROSOFT_CLIENT_ID,
        client_secret: MICROSOFT_CLIENT_SECRET,
        scope: SCOPE_REQUEST,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: base_url + "/auth/openid"
    };

    const tokenResponse = await fetch(tokenURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(tokenParams).toString()
    });

    if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error("Failed to get token", errorData);
        return null;
    }

    const tokenData = await tokenResponse.json();

    const idPayload = JSON.parse(atob(tokenData.id_token.split(".")[1]));

    const userInfo = {
        fullName: idPayload.given_name + " " + idPayload.family_name,
        userName: idPayload.email,
        role: $Enums.Role.STUDENT
    };

    const createdUser = await pdb.user.upsert({
        where: { userName: userInfo.userName },
        update: userInfo,
        create: userInfo
    });

    const oauthInfo = {
        oauthId: idPayload.sub,
        userId: createdUser.id,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token
    };

    return await pdb.oAuth.upsert({
        where: { oauthId: idPayload.sub },
        update: oauthInfo,
        create: oauthInfo
    });
}
