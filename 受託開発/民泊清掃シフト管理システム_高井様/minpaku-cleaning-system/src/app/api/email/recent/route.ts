import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

interface TokenResponse {
    access_token: string;
    expires_in: number;
}

interface GmailMessage {
    id: string;
    threadId: string;
}

interface GmailMessageDetail {
    id: string;
    snippet: string;
    payload: {
        headers: Array<{ name: string; value: string }>;
    };
    internalDate: string;
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = session.user.organizationId;

    try {
        // 組織のGmail設定を取得
        const settings = await prisma.setting.findMany({
            where: { organizationId },
        });

        const settingsMap = new Map(settings.map(s => [s.key, s.value]));

        const clientId = settingsMap.get("gmail_client_id");
        const clientSecret = settingsMap.get("gmail_client_secret");
        const refreshToken = settingsMap.get("gmail_refresh_token");

        if (!clientId || !clientSecret || !refreshToken) {
            return NextResponse.json(
                { error: "Gmail設定が不完全です" },
                { status: 400 }
            );
        }

        // アクセストークンを取得
        const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: "refresh_token",
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error("[GMAIL] Token refresh failed:", errorText);
            return NextResponse.json(
                { error: "アクセストークンの取得に失敗しました" },
                { status: 500 }
            );
        }

        const tokens: TokenResponse = await tokenResponse.json();

        // 直近5件のメールを取得
        const listResponse = await fetch(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5",
            {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
            }
        );

        if (!listResponse.ok) {
            const errorText = await listResponse.text();
            console.error("[GMAIL] List messages failed:", errorText);
            return NextResponse.json(
                { error: "メール一覧の取得に失敗しました" },
                { status: 500 }
            );
        }

        const listData = await listResponse.json();
        const messages: GmailMessage[] = listData.messages || [];

        // 各メールの詳細を取得
        const emailDetails = await Promise.all(
            messages.map(async (msg) => {
                const detailResponse = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
                    {
                        headers: { Authorization: `Bearer ${tokens.access_token}` },
                    }
                );

                if (!detailResponse.ok) {
                    return null;
                }

                const detail: GmailMessageDetail = await detailResponse.json();
                const headers = detail.payload.headers;

                const getHeader = (name: string) =>
                    headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "";

                return {
                    id: detail.id,
                    subject: getHeader("Subject"),
                    from: getHeader("From"),
                    date: getHeader("Date"),
                    snippet: detail.snippet,
                };
            })
        );

        return NextResponse.json({
            success: true,
            emails: emailDetails.filter(Boolean),
        });
    } catch (error) {
        console.error("[GMAIL] Error fetching emails:", error);
        return NextResponse.json(
            { error: "メールの取得に失敗しました" },
            { status: 500 }
        );
    }
}
