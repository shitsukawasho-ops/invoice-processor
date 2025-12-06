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

  const organizationId = session.user.organizationId;

  const tasks = await prisma.cleaningTask.findMany({
    where: {
      property: { organizationId },
    },
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

  const organizationId = session.user.organizationId;

  try {
    const body = await request.json();
    const { propertyId, cleaningDate, checkoutTime, cleaningFee, notes, staffId } = body;

    if (!propertyId || !cleaningDate) {
      return NextResponse.json(
        { error: "物件と清掃日は必須です" },
        { status: 400 }
      );
    }

    // 物件の情報を取得してデフォルト値を設定（組織チェック）
    const property = await prisma.property.findFirst({
      where: { id: propertyId, organizationId },
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
    if (!staffId) {
      try {
        const sentCount = await sendTaskNotifications(task.id);
        console.log(`[AUTO NOTIFY] Task ${task.id}: sent ${sentCount} notifications`);
      } catch (notifyError) {
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
