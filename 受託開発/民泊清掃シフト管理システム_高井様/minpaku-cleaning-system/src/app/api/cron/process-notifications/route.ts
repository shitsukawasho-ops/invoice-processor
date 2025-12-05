import { NextRequest, NextResponse } from "next/server";
import { processScheduledNotifications } from "@/app/_lib/notification";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Cron認証（Vercel Cron Job用）
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sentCount = await processScheduledNotifications();

    return NextResponse.json({
      success: true,
      sentCount,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to process notifications" },
      { status: 500 }
    );
  }
}
