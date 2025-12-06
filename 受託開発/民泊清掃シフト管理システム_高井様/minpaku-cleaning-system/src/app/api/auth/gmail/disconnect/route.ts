import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = session.user.organizationId;

    try {
        // Gmail関連の設定を削除
        await prisma.setting.deleteMany({
            where: {
                organizationId,
                key: {
                    in: [
                        "gmail_client_id",
                        "gmail_client_secret",
                        "gmail_refresh_token",
                        "gmail_connected_email",
                        "gmail_target_email",
                    ],
                },
            },
        });

        console.log("[GMAIL OAuth] Disconnected for organization:", organizationId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[GMAIL OAuth] Disconnect error:", error);
        return NextResponse.json(
            { error: "Failed to disconnect Gmail" },
            { status: 500 }
        );
    }
}
