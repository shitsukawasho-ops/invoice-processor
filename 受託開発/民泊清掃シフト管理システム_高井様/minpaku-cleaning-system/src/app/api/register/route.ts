import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { organizationName, slug, adminName, email, password } = body;

        // バリデーション
        if (!organizationName || !slug || !adminName || !email || !password) {
            return NextResponse.json(
                { error: "すべての項目を入力してください" },
                { status: 400 }
            );
        }

        // slug のフォーマットチェック（英小文字、数字、ハイフンのみ）
        if (!/^[a-z0-9-]+$/.test(slug)) {
            return NextResponse.json(
                { error: "組織IDは英小文字、数字、ハイフンのみ使用できます" },
                { status: 400 }
            );
        }

        // メールアドレス形式チェック
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "有効なメールアドレスを入力してください" },
                { status: 400 }
            );
        }

        // パスワード強度チェック（8文字以上）
        if (password.length < 8) {
            return NextResponse.json(
                { error: "パスワードは8文字以上で設定してください" },
                { status: 400 }
            );
        }

        // 既存の組織チェック
        const existingOrg = await prisma.organization.findUnique({
            where: { slug },
        });
        if (existingOrg) {
            return NextResponse.json(
                { error: "この組織IDは既に使用されています" },
                { status: 400 }
            );
        }

        // 既存のメールチェック
        const existingAdmin = await prisma.admin.findUnique({
            where: { email },
        });
        if (existingAdmin) {
            return NextResponse.json(
                { error: "このメールアドレスは既に使用されています" },
                { status: 400 }
            );
        }

        // パスワードハッシュ化
        const passwordHash = await hash(password, 12);

        // トランザクションで組織と管理者を作成
        const result = await prisma.$transaction(async (tx) => {
            // 組織作成
            const organization = await tx.organization.create({
                data: {
                    name: organizationName,
                    slug,
                    isActive: true,
                },
            });

            // 管理者作成
            const admin = await tx.admin.create({
                data: {
                    organizationId: organization.id,
                    email,
                    passwordHash,
                    name: adminName,
                },
            });

            return { organization, admin };
        });

        return NextResponse.json({
            success: true,
            organizationId: result.organization.id,
            slug: result.organization.slug,
            message: "組織と管理者アカウントを作成しました",
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "登録中にエラーが発生しました" },
            { status: 500 }
        );
    }
}
