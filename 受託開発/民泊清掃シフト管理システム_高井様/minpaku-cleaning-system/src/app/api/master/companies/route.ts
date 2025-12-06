import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // マスターアカウントかチェック
    const admin = await prisma.admin.findUnique({
        where: { id: session.user.id },
    });

    if (!admin?.isMaster) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // 全会社を取得
        const companies = await prisma.organization.findMany({
            include: {
                _count: {
                    select: {
                        admins: true,
                        properties: true,
                        staff: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // 統計情報
        const [totalProperties, totalStaff, totalTasks] = await Promise.all([
            prisma.property.count(),
            prisma.staff.count(),
            prisma.cleaningTask.count(),
        ]);

        return NextResponse.json({
            companies,
            stats: {
                totalCompanies: companies.length,
                totalProperties,
                totalStaff,
                totalTasks,
            },
        });
    } catch (error) {
        console.error("Failed to fetch companies:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
