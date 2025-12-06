import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendCleaningRequest } from "@/lib/line";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizationId = session.user.organizationId;
  const { id } = await params;

  try {
    // 組織チェック含む（IDOR対策）
    const task = await prisma.cleaningTask.findFirst({
      where: {
        id,
        property: { organizationId }
      },
      include: {
        property: true,
        staff: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
    }

    if (!task.staff || !task.staff.lineUserId) {
      return NextResponse.json(
        { error: "スタッフが割り当てられていないか、LINE連携されていません" },
        { status: 400 }
      );
    }

    const cleaningDateStr = format(task.cleaningDate, "M月d日（E）", { locale: ja });

    const messageId = await sendCleaningRequest(task.staff.lineUserId, {
      taskId: task.id,
      propertyName: task.property.name,
      propertyAddress: task.property.address,
      cleaningDate: cleaningDateStr,
      checkoutTime: task.checkoutTime,
      cleaningFee: task.cleaningFee,
    }, organizationId);

    if (messageId) {
      // 通知履歴を保存
      await prisma.notificationQueue.create({
        data: {
          cleaningTaskId: id,
          staffId: task.staff.id,
          status: "sent",
          scheduledAt: new Date(),
          sentAt: new Date(),
          lineMessageId: messageId,
        },
      });

      // タスクの通知日時を更新
      await prisma.cleaningTask.update({
        where: { id },
        data: {
          notificationSentAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "通知を送信しました",
      });
    } else {
      return NextResponse.json(
        { error: "LINE通知の送信に失敗しました" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "通知の送信に失敗しました" },
      { status: 500 }
    );
  }
}
