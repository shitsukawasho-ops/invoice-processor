import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendTaskNotifications } from "@/lib/notification";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await prisma.cleaningTask.findMany({
    include: {
      property: true,
      staff: true,
    },
    orderBy: { cleaningDate: "asc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { propertyId, cleaningDate, checkoutTime, cleaningFee, notes, staffId } = body;

    if (!propertyId || !cleaningDate) {
      return NextResponse.json(
        { error: "物件と清掃日は必須です" },
        { status: 400 }
      );
    }

    // 物件の情報を取得してデフォルト値を設定
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: "物件が見つかりません" }, { status: 404 });
    }

    const task = await prisma.cleaningTask.create({
      data: {
        propertyId,
        cleaningDate: new Date(cleaningDate),
        checkoutTime: checkoutTime || property.checkoutTime,
        cleaningFee: cleaningFee || property.cleaningFee,
        notes,
        staffId: staffId || null,
        status: staffId ? "confirmed" : "pending",
        acceptedAt: staffId ? new Date() : null,
      },
      include: {
        property: true,
        staff: true,
      },
    });

    // スタッフが割り当てられていない場合のみ自動通知を実行
    // (1ヶ月ルールに基づき、担当可能なスタッフ全員に通知)
    if (!staffId) {
      try {
        const sentCount = await sendTaskNotifications(task.id);
        console.log(`[AUTO NOTIFY] Task ${task.id}: sent ${sentCount} notifications`);
      } catch (notifyError) {
        // 通知に失敗してもタスク作成自体は成功とする
        console.error("[AUTO NOTIFY] Failed to send notifications:", notifyError);
      }
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "タスクの作成に失敗しました" },
      { status: 500 }
    );
  }
}

