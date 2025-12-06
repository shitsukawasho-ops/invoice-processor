import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope: string;
}

interface UserInfo {
    email: string;
    verified_email: boolean;
}

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // エラーチェック
    if (error) {
        console.error("[GMAIL OAuth] Auth error:", error);
        return NextResponse.redirect(
            new URL(`/settings?error=${error}`, request.url)
        );
    }

    if (!code || !state) {
        console.error("[GMAIL OAuth] Missing code or state");
        return NextResponse.redirect(
            new URL("/settings?error=invalid_callback", request.url)
        );
    }

    // state を検証
    let stateData: { organizationId: string; timestamp: number };
    try {
        stateData = JSON.parse(Buffer.from(state, "base64").toString());
    } catch {
        console.error("[GMAIL OAuth] Invalid state");
        return NextResponse.redirect(
            new URL("/settings?error=invalid_state", request.url)
        );
    }

    // セッションの組織IDと一致するか確認
    if (stateData.organizationId !== session.user.organizationId) {
        console.error("[GMAIL OAuth] Organization ID mismatch");
        return NextResponse.redirect(
            new URL("/settings?error=invalid_session", request.url)
        );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("[GMAIL OAuth] Missing OAuth credentials");
        return NextResponse.redirect(
            new URL("/settings?error=oauth_not_configured", request.url)
        );
    }

    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const redirectUri = `${baseUrl}/api/auth/gmail/callback`;

    try {
        // 認証コードをトークンに交換
        const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error("[GMAIL OAuth] Token exchange failed:", errorText);
            return NextResponse.redirect(
                new URL("/settings?error=token_exchange_failed", request.url)
            );
        }

        const tokens: TokenResponse = await tokenResponse.json();
        console.log("[GMAIL OAuth] Tokens obtained successfully");

        if (!tokens.refresh_token) {
            console.error("[GMAIL OAuth] No refresh token received");
            return NextResponse.redirect(
                new URL("/settings?error=no_refresh_token", request.url)
            );
        }

        // ユーザー情報を取得（メールアドレス）
        const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        let userEmail = "";
        if (userInfoResponse.ok) {
            const userInfo: UserInfo = await userInfoResponse.json();
            userEmail = userInfo.email;
            console.log("[GMAIL OAuth] User email:", userEmail);
        }

        // DBに保存（既存のガクライアントIDなどは上書き）
        const organizationId = session.user.organizationId;

        // refresh_token を保存
        await prisma.setting.upsert({
            where: {
                organizationId_key: {
                    organizationId,
                    key: "gmail_refresh_token",
                },
            },
            update: { value: tokens.refresh_token },
            create: {
                organizationId,
                key: "gmail_refresh_token",
                value: tokens.refresh_token,
            },
        });

        // client_id を保存（環境変数から）
        await prisma.setting.upsert({
            where: {
                organizationId_key: {
                    organizationId,
                    key: "gmail_client_id",
                },
            },
            update: { value: clientId },
            create: {
                organizationId,
                key: "gmail_client_id",
                value: clientId,
            },
        });

        // client_secret を保存（環境変数から）
        await prisma.setting.upsert({
            where: {
                organizationId_key: {
                    organizationId,
                    key: "gmail_client_secret",
                },
            },
            update: { value: clientSecret },
            create: {
                organizationId,
                key: "gmail_client_secret",
                value: clientSecret,
            },
        });

        // 連携したメールアドレスを保存
        if (userEmail) {
            await prisma.setting.upsert({
                where: {
                    organizationId_key: {
                        organizationId,
                        key: "gmail_connected_email",
                    },
                },
                update: { value: userEmail },
                create: {
                    organizationId,
                    key: "gmail_connected_email",
                    value: userEmail,
                },
            });
        }

        console.log("[GMAIL OAuth] Settings saved for organization:", organizationId);

        return NextResponse.redirect(
            new URL("/settings?success=gmail_connected", request.url)
        );
    } catch (error) {
        console.error("[GMAIL OAuth] Error:", error);
        return NextResponse.redirect(
            new URL("/settings?error=oauth_error", request.url)
        );
    }
}
