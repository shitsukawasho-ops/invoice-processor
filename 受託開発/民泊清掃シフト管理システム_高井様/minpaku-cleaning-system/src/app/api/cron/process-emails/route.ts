import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchUnreadReservationEmails, markAsRead } from "@/lib/gmail";
import { processReservationEmail } from "@/lib/email-parser";

export const dynamic = "force-dynamic";

interface OrgGmailSettings {
    organizationId: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    targetEmail: string;
}

// 全組織のGmail設定を取得
async function getAllOrgGmailSettings(): Promise<OrgGmailSettings[]> {
    const orgs = await prisma.organization.findMany({
        where: { isActive: true },
    });

    const results: OrgGmailSettings[] = [];

    for (const org of orgs) {
        const settings = await prisma.setting.findMany({
            where: { organizationId: org.id },
        });

        const settingsMap = new Map(settings.map(s => [s.key, s.value]));

        // 必須設定が揃っている組織のみ追加
        if (
            settingsMap.get("gmail_client_id") &&
            settingsMap.get("gmail_client_secret") &&
            settingsMap.get("gmail_refresh_token")
        ) {
            results.push({
                organizationId: org.id,
                clientId: settingsMap.get("gmail_client_id")!,
                clientSecret: settingsMap.get("gmail_client_secret")!,
                refreshToken: settingsMap.get("gmail_refresh_token")!,
                targetEmail: settingsMap.get("gmail_target_email") || "",
            });
        }
    }

    return results;
}

export async function GET(request: NextRequest) {
    // Cron認証（Vercel Cron Job用）
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // CRON_SECRETが未設定の場合はエラー（認証バイパス防止）
    if (!cronSecret) {
        console.error("CRON_SECRET is not configured");
        return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        console.log("[CRON EMAIL] Starting email processing for all organizations...");

        // 全組織のGmail設定を取得
        const orgSettings = await getAllOrgGmailSettings();
        console.log(`[CRON EMAIL] Found ${orgSettings.length} organizations with Gmail config`);

        const allResults: Array<{
            organizationId: string;
            emailId: string;
            subject: string;
            success: boolean;
            taskId?: string;
            error?: string;
        }> = [];

        let totalProcessed = 0;
        let totalSuccess = 0;

        for (const settings of orgSettings) {
            console.log(`[CRON EMAIL] Processing org: ${settings.organizationId}`);

            try {
                // その組織のGmail設定でメールを取得
                const emails = await fetchUnreadReservationEmails(10, {
                    clientId: settings.clientId,
                    clientSecret: settings.clientSecret,
                    refreshToken: settings.refreshToken,
                });

                console.log(`[CRON EMAIL] Org ${settings.organizationId}: Found ${emails.length} emails`);

                for (const email of emails) {
                    console.log(`[CRON EMAIL] Processing: ${email.subject}`);

                    // メールを処理（組織IDを渡す）
                    const result = await processReservationEmail(
                        email.subject,
                        email.body,
                        email.id,
                        settings.organizationId
                    );

                    allResults.push({
                        organizationId: settings.organizationId,
                        emailId: email.id,
                        subject: email.subject,
                        success: result.success,
                        taskId: result.taskId,
                        error: result.error,
                    });

                    totalProcessed++;
                    if (result.success) {
                        totalSuccess++;
                        // 処理したメールを既読に
                        await markAsRead(email.id, {
                            clientId: settings.clientId,
                            clientSecret: settings.clientSecret,
                            refreshToken: settings.refreshToken,
                        });
                    }
                }
            } catch (orgError) {
                console.error(`[CRON EMAIL] Error processing org ${settings.organizationId}:`, orgError);
            }
        }

        console.log(`[CRON EMAIL] Total: Processed ${totalSuccess}/${totalProcessed} emails successfully`);

        return NextResponse.json({
            success: true,
            processedAt: new Date().toISOString(),
            organizationsProcessed: orgSettings.length,
            totalEmails: totalProcessed,
            successCount: totalSuccess,
            results: allResults,
        });
    } catch (error) {
        console.error("[CRON EMAIL] Error:", error);
        return NextResponse.json(
            { error: "Failed to process emails" },
            { status: 500 }
        );
    }
}
