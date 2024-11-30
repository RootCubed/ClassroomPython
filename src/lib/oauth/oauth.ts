import pdb from "$lib/server/prisma-db";
import { PUBLIC_MICROSOFT_CLIENT_ID } from "$env/static/public";
import { MICROSOFT_CLIENT_SECRET } from "$env/static/private";
import { $Enums, type OAuth } from "@prisma/client";
import { SCOPE_REQUEST, OAUTH_ENDPOINT } from "./constants";
import type { ClientUser } from "$lib/server/auth";

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

    const oauthId = idPayload.oid;
    const userInfo = {
        fullName: idPayload.given_name + " " + idPayload.family_name,
        userName: idPayload.email
    };

    const existingOAuth = await pdb.oAuth.findUnique({
        where: { oauthId }
    });

    if (existingOAuth) {
        await pdb.user.update({
            where: { id: existingOAuth.userId },
            data: userInfo
        });

        return await pdb.oAuth.update({
            where: { oauthId },
            data: {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token
            }
        });
    }

    const user = await pdb.user.upsert({
        where: { userName: userInfo.userName },
        create: { ...userInfo, role: $Enums.Role.STUDENT },
        update: userInfo
    });

    return await pdb.oAuth.create({
        data: {
            oauthId,
            userId: user.id,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token
        }
    });
}

export async function graphRequest(oauth: OAuth, endpoint: string, retry = true) {
    const response = await fetch(endpoint, {
        headers: {
            Authorization: `Bearer ${oauth.accessToken}`
        }
    });

    const resp = await response.json();

    if (response.ok) {
        return resp;
    }

    if (response.status === 401 && retry) {
        const updatedOAuth = await refreshToken(oauth);

        if (!updatedOAuth) {
            return null;
        }

        return graphRequest(updatedOAuth, endpoint, false);
    }
}

export async function refreshToken(oauth: OAuth) {
    const tokenURL = new URL(OAUTH_ENDPOINT + "/token");

    const tokenParams = {
        client_id: PUBLIC_MICROSOFT_CLIENT_ID,
        client_secret: MICROSOFT_CLIENT_SECRET,
        scope: SCOPE_REQUEST,
        refresh_token: oauth.refreshToken,
        grant_type: "refresh_token"
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
        console.error("Failed to refresh token", errorData);
        return null;
    }

    const tokenData = await tokenResponse.json();

    return await pdb.oAuth.update({
        where: { oauthId: oauth.oauthId },
        data: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token
        }
    });
}

export async function getOrCreateMSUser(oauth: OAuth, username: string): Promise<ClientUser> {
    const existingUser = await pdb.user.findUnique({
        where: { userName: username }
    });

    if (existingUser) {
        return existingUser;
    }

    let endpoint = `https://graph.microsoft.com/v1.0/users?$filter=mail eq '${username}'`;
    const usersResult = await graphRequest(oauth, endpoint);

    if (!usersResult || usersResult.value.length == 0) {
        throw new Error("Failed to get user info");
    }

    const userInfo = usersResult.value[0];

    return await pdb.user.create({
        data: {
            userName: username,
            fullName: `${userInfo.givenName} ${userInfo.surname}`,
            role: $Enums.Role.STUDENT,
            oauth: {
                create: {
                    oauthId: userInfo.id,
                    accessToken: "",
                    refreshToken: ""
                }
            }
        }
    });
}
