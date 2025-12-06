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

  const organizationId = session.user.organizationId;
  const { id } = await params;

  const staff = await prisma.staff.findFirst({
    where: { id, organizationId },
    include: {
      propertyAssignments: {
        include: {
          property: true,
        },
      },
      cleaningTasks: {
        include: {
          property: true,
        },
        orderBy: { cleaningDate: "desc" },
      },
    },
  });

  if (!staff) {
    return NextResponse.json({ error: "スタッフが見つかりません" }, { status: 404 });
  }

  return NextResponse.json(staff);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizationId = session.user.organizationId;
  const { id } = await params;

  // 組織チェック
  const existing = await prisma.staff.findFirst({
    where: { id, organizationId },
  });

  if (!existing) {
    return NextResponse.json({ error: "スタッフが見つかりません" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { name, phone, isActive, propertyIds } = body;

    // 既存の割り当てを削除して新しく作成
    if (propertyIds) {
      await prisma.staffPropertyAssignment.deleteMany({
        where: { staffId: id },
      });
    }

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(isActive !== undefined && { isActive }),
        ...(propertyIds && {
          propertyAssignments: {
            create: propertyIds.map((propertyId: string) => ({
              propertyId,
            })),
          },
        }),
      },
      include: {
        propertyAssignments: {
          include: {
            property: true,
          },
        },
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { error: "スタッフの更新に失敗しました" },
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

  const organizationId = session.user.organizationId;
  const { id } = await params;

  // 組織チェック
  const existing = await prisma.staff.findFirst({
    where: { id, organizationId },
  });

  if (!existing) {
    return NextResponse.json({ error: "スタッフが見つかりません" }, { status: 404 });
  }

  try {
    await prisma.staff.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting staff:", error);
    return NextResponse.json(
      { error: "スタッフの削除に失敗しました" },
      { status: 500 }
    );
  }
}
