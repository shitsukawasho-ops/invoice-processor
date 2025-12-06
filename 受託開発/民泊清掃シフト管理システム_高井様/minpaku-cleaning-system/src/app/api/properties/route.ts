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

  const properties = await prisma.property.findMany({
    where: { organizationId },
    include: {
      _count: {
        select: {
          cleaningTasks: true,
          staffAssignments: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(properties);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizationId = session.user.organizationId;

  try {
    const body = await request.json();
    const { name, address, checkoutTime, cleaningDurationMinutes, cleaningFee } = body;

    if (!name || !address) {
      return NextResponse.json(
        { error: "物件名と住所は必須です" },
        { status: 400 }
      );
    }

    const property = await prisma.property.create({
      data: {
        organizationId,
        name,
        address,
        checkoutTime: checkoutTime || "11:00",
        cleaningDurationMinutes: cleaningDurationMinutes || 120,
        cleaningFee: cleaningFee || 5000,
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "物件の作成に失敗しました" },
      { status: 500 }
    );
  }
}
