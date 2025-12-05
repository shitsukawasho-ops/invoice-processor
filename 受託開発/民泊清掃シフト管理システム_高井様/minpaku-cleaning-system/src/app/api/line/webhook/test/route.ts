import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { acceptTask, declineTask } from "@/app/_lib/notification";

/**
 * POST: Webhook処理をシミュレートするテスト用エンドポイント
 * 本番環境では無効化すること
 */
export async function POST(request: NextRequest) {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { action, taskId, staffId } = body;

        if (!action || !taskId || !staffId) {
            return NextResponse.json(
                { error: "action, taskId, staffId が必要です" },
                { status: 400 }
            );
        }

        if (action === "accept") {
            await acceptTask(taskId, staffId);
            return NextResponse.json({ success: true, message: "タスクを受諾しました" });
        } else if (action === "decline") {
            await declineTask(taskId, staffId);
            return NextResponse.json({ success: true, message: "タスクを辞退しました" });
        } else {
            return NextResponse.json({ error: "無効なアクション" }, { status: 400 });
        }
    } catch (error) {
        console.error("[WEBHOOK TEST] Error:", error);
        return NextResponse.json(
            { error: "テスト実行に失敗しました" },
            { status: 500 }
        );
    }
}
