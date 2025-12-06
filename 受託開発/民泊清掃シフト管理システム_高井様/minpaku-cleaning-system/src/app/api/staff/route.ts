import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizationId = session.user.organizationId;

  const staff = await prisma.staff.findMany({
    where: { organizationId },
    include: {
      propertyAssignments: {
        include: {
          property: true,
        },
      },
      _count: {
        select: { cleaningTasks: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(staff);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizationId = session.user.organizationId;

  try {
    const body = await request.json();
    const { name, phone, propertyIds } = body;

    if (!name) {
      return NextResponse.json({ error: "名前は必須です" }, { status: 400 });
    }

    const staff = await prisma.staff.create({
      data: {
        organizationId,
        name,
        phone,
        propertyAssignments: {
          create: propertyIds?.map((propertyId: string) => ({
            propertyId,
          })) || [],
        },
      },
      include: {
        propertyAssignments: {
          include: {
            property: true,
          },
        },
      },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error("Error creating staff:", error);
    return NextResponse.json(
      { error: "スタッフの作成に失敗しました" },
      { status: 500 }
    );
  }
}
