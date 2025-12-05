import { NextRequest, NextResponse } from "next/server";
import { fetchUnreadReservationEmails, markAsRead } from "@/lib/gmail";
import { processReservationEmail } from "@/lib/email-parser";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    // Cron認証（Vercel Cron Job用）
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        console.log("[CRON EMAIL] Starting email processing...");

        // 未読の予約メールを取得
        const emails = await fetchUnreadReservationEmails(10);
        console.log(`[CRON EMAIL] Found ${emails.length} unread emails`);

        const results: Array<{
            emailId: string;
            subject: string;
            success: boolean;
            taskId?: string;
            error?: string;
        }> = [];

        for (const email of emails) {
            console.log(`[CRON EMAIL] Processing: ${email.subject}`);

            // メールを処理
            const result = await processReservationEmail(
                email.subject,
                email.body,
                email.id
            );

            results.push({
                emailId: email.id,
                subject: email.subject,
                success: result.success,
                taskId: result.taskId,
                error: result.error,
            });

            // 処理したメールを既読に
            if (result.success) {
                await markAsRead(email.id);
            }
        }

        const successCount = results.filter((r) => r.success).length;
        console.log(`[CRON EMAIL] Processed ${successCount}/${emails.length} emails successfully`);

        return NextResponse.json({
            success: true,
            processedAt: new Date().toISOString(),
            totalEmails: emails.length,
            successCount,
            results,
        });
    } catch (error) {
        console.error("[CRON EMAIL] Error:", error);
        return NextResponse.json(
            { error: "Failed to process emails" },
            { status: 500 }
        );
    }
}
