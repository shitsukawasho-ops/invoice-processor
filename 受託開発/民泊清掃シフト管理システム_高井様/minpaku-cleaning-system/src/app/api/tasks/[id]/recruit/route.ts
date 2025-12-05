import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendTaskNotifications } from "@/app/_lib/notification";

/**
 * POST: 全スタッフに再募集LINE通知を送信
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id: taskId } = await params;

        // タスクの存在確認
        const task = await prisma.cleaningTask.findUnique({
            where: { id: taskId },
            include: { property: true },
        });

        if (!task) {
            return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
        }

        // タスクをpending状態にリセット（再募集のため）
        await prisma.cleaningTask.update({
            where: { id: taskId },
            data: {
                status: "pending",
                staffId: null,
                notificationSentAt: null,
            },
        });

        // 既存の通知キューをクリア
        await prisma.notificationQueue.deleteMany({
            where: { cleaningTaskId: taskId },
        });

        // 全担当スタッフにLINE通知を送信
        const sentCount = await sendTaskNotifications(taskId);

        return NextResponse.json({
            success: true,
            sentCount,
            message: `${sentCount} 名のスタッフに募集通知を送信しました`,
        });
    } catch (error) {
        console.error("[RECRUIT] Error:", error);
        return NextResponse.json(
            { error: "募集通知の送信に失敗しました" },
            { status: 500 }
        );
    }
}
