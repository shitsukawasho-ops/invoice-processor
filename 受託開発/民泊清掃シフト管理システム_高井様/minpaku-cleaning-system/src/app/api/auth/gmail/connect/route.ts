import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/userinfo.email",
];

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        console.error("[GMAIL OAuth] GOOGLE_CLIENT_ID is not configured");
        return NextResponse.redirect(
            new URL("/settings?error=oauth_not_configured", request.url)
        );
    }

    // ローカル環境かどうかを判定してリダイレクトURIを設定
    const baseUrl = (process.env.NEXTAUTH_URL || request.nextUrl.origin).trim();
    const redirectUri = `${baseUrl}/api/auth/gmail/callback`;

    // state パラメータに組織IDを含める（CSRF対策も兼ねる）
    const state = Buffer.from(
        JSON.stringify({
            organizationId: session.user.organizationId,
            timestamp: Date.now(),
        })
    ).toString("base64");

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: SCOPES.join(" "),
        access_type: "offline",
        prompt: "consent", // refresh_tokenを確実に取得するため
        state,
    });

    const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;

    console.log("[GMAIL OAuth] Redirecting to Google auth:", authUrl);
    return NextResponse.redirect(authUrl);
}
