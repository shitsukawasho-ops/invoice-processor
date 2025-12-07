import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processReservationEmail, generateSampleEmail } from "@/lib/email-parser";

/**
 * POST: テスト用メールを処理
 * 実際のメール受信をシミュレートしてタスク作成をテストする
 */
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { subject, emailBody, propertyName, checkoutDate, useTemplate } = body;

        let emailSubject: string;
        let emailContent: string;

        if (useTemplate && propertyName && checkoutDate) {
            // テンプレートからサンプルメールを生成
            const sample = generateSampleEmail(propertyName, checkoutDate);
            emailSubject = sample.subject;
            emailContent = sample.body;
        } else if (subject && emailBody) {
            // 直接指定されたメール内容を使用
            emailSubject = subject;
            emailContent = emailBody;
        } else {
            return NextResponse.json(
                { error: "subject/emailBody または propertyName/checkoutDate/useTemplate が必要です" },
                { status: 400 }
            );
        }

        console.log("[EMAIL TEST] Processing test email:", emailSubject);

        const result = await processReservationEmail(
            emailSubject,
            emailContent,
            "test-" + Date.now(),
            session.user.organizationId
        );

        return NextResponse.json({
            success: result.success,
            taskId: result.taskId,
            error: result.error,
            parsedEmail: {
                subject: emailSubject,
                body: emailContent,
            },
        });
    } catch (error) {
        console.error("[EMAIL TEST] Error:", error);
        return NextResponse.json(
            { error: "メール処理に失敗しました" },
            { status: 500 }
        );
    }
}
