import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 認証不要のパス
const publicPaths = [
    "/login",
    "/register",
    "/api/register",
    "/api/auth",
    "/api/line/webhook",
    "/api/cron",
];

export function middleware(request: NextRequest) {
    const { pathname, hostname } = request.nextUrl;

    // サブドメインを抽出
    // 例: org1.minpaku-cleaning-system.vercel.app -> org1
    // ローカル: org1.localhost:3000 -> org1
    let subdomain: string | null = null;

    const hostParts = hostname.split(".");

    // Vercel本番環境: *.minpaku-cleaning-system.vercel.app
    // カスタムドメイン: *.minpaku.app
    // ローカル: *.localhost
    if (hostParts.length >= 3 && hostParts[0] !== "www") {
        // org1.example.com の場合
        subdomain = hostParts[0];
    } else if (hostname.includes("localhost") && hostParts.length >= 2) {
        // org1.localhost の場合
        subdomain = hostParts[0] !== "localhost" ? hostParts[0] : null;
    }

    // サブドメインをヘッダーに追加
    const requestHeaders = new Headers(request.headers);
    if (subdomain && subdomain !== "default") {
        requestHeaders.set("x-organization-slug", subdomain);
    }

    // 公開パスはそのまま通す
    const isPublicPath = publicPaths.some(
        (path) => pathname === path || pathname.startsWith(path + "/")
    );

    // APIパスやstaticファイルはそのまま通す
    if (
        pathname.startsWith("/api/") ||
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    }

    // 公開パスはそのまま通す
    if (isPublicPath) {
        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    }

    return NextResponse.next({
        request: { headers: requestHeaders },
    });
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
