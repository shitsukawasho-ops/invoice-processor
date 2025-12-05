import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const task = await prisma.cleaningTask.findUnique({
    where: { id },
    include: {
      property: true,
      staff: true,
      notifications: {
        include: {
          staff: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const { cleaningDate, checkoutTime, cleaningFee, notes, staffId, status } = body;

    const updateData: Record<string, unknown> = {};
    
    if (cleaningDate !== undefined) updateData.cleaningDate = new Date(cleaningDate);
    if (checkoutTime !== undefined) updateData.checkoutTime = checkoutTime;
    if (cleaningFee !== undefined) updateData.cleaningFee = cleaningFee;
    if (notes !== undefined) updateData.notes = notes;
    if (staffId !== undefined) updateData.staffId = staffId || null;
    if (status !== undefined) updateData.status = status;

    // スタッフが割り当てられた場合は確定扱い
    if (staffId && status !== "completed" && status !== "cancelled") {
      updateData.status = "confirmed";
      updateData.acceptedAt = new Date();
    }

    // 完了ステータスの場合
    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    const task = await prisma.cleaningTask.update({
      where: { id },
      data: updateData,
      include: {
        property: true,
        staff: true,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "タスクの更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.cleaningTask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "タスクの削除に失敗しました" },
      { status: 500 }
    );
  }
}
