import prisma from "@/lib/prisma";
import { sendCleaningRequest, sendConfirmation } from "./line";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

/**
 * 通知を送信すべきかどうかを判定（1ヶ月ルール）
 */
export function shouldNotifyNow(cleaningDate: Date): boolean {
    const now = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    // 清掃予定日が1ヶ月以内なら即時通知
    return cleaningDate <= oneMonthFromNow;
}

/**
 * 通知スケジュール日を計算
 */
export function getScheduledNotificationDate(cleaningDate: Date): Date {
    const scheduledDate = new Date(cleaningDate);
    scheduledDate.setMonth(scheduledDate.getMonth() - 1);

    const now = new Date();
    // 既に1ヶ月前を過ぎている場合は即時
    return scheduledDate < now ? now : scheduledDate;
}

/**
 * 物件を担当可能なスタッフを取得
 */
export async function getAvailableStaff(propertyId: string) {
    return prisma.staff.findMany({
        where: {
            isActive: true,
            lineUserId: { not: null },
            propertyAssignments: {
                some: {
                    propertyId,
                },
            },
        },
    });
}

/**
 * タスクの通知を送信
 */
export async function sendTaskNotifications(taskId: string): Promise<number> {
    const task = await prisma.cleaningTask.findUnique({
        where: { id: taskId },
        include: {
            property: true,
        },
    });

    if (!task || task.status !== "pending") {
        return 0;
    }

    // 1ヶ月ルールチェック
    if (!shouldNotifyNow(task.cleaningDate)) {
        // 通知キューに追加（スケジュール）
        const scheduledAt = getScheduledNotificationDate(task.cleaningDate);
        const availableStaff = await getAvailableStaff(task.propertyId);

        for (const staff of availableStaff) {
            await prisma.notificationQueue.upsert({
                where: {
                    id: `${taskId}-${staff.id}`,
                },
                update: {},
                create: {
                    id: `${taskId}-${staff.id}`,
                    cleaningTaskId: taskId,
                    staffId: staff.id,
                    status: "scheduled",
                    scheduledAt,
                },
            });
        }

        return 0;
    }

    // 即時通知
    const availableStaff = await getAvailableStaff(task.propertyId);
    let sentCount = 0;

    for (const staff of availableStaff) {
        if (!staff.lineUserId) continue;

        const cleaningDateStr = format(task.cleaningDate, "M月d日（E）", { locale: ja });

        const messageId = await sendCleaningRequest(staff.lineUserId, {
            taskId: task.id,
            propertyName: task.property.name,
            propertyAddress: task.property.address,
            cleaningDate: cleaningDateStr,
            checkoutTime: task.checkoutTime,
            cleaningFee: task.cleaningFee,
        });

        if (messageId) {
            await prisma.notificationQueue.create({
                data: {
                    cleaningTaskId: taskId,
                    staffId: staff.id,
                    status: "sent",
                    scheduledAt: new Date(),
                    sentAt: new Date(),
                    lineMessageId: messageId,
                },
            });
            sentCount++;
        }
    }

    if (sentCount > 0) {
        await prisma.cleaningTask.update({
            where: { id: taskId },
            data: {
                status: "notifying",
                notificationSentAt: new Date(),
            },
        });
    }

    return sentCount;
}

/**
 * スタッフが清掃を受諾
 */
export async function acceptTask(taskId: string, staffId: string): Promise<boolean> {
    const task = await prisma.cleaningTask.findUnique({
        where: { id: taskId },
        include: { property: true },
    });

    const staff = await prisma.staff.findUnique({
        where: { id: staffId },
    });

    if (!task || !staff) {
        return false;
    }

    // 既に他のスタッフに割り当てられている場合
    if (task.staffId && task.staffId !== staffId) {
        return false;
    }

    // タスクを更新
    await prisma.cleaningTask.update({
        where: { id: taskId },
        data: {
            staffId,
            status: "confirmed",
            acceptedAt: new Date(),
        },
    });

    // 通知キューを更新
    await prisma.notificationQueue.updateMany({
        where: {
            cleaningTaskId: taskId,
            staffId,
        },
        data: {
            status: "accepted",
            respondedAt: new Date(),
        },
    });

    // 他のスタッフへの通知を期限切れに
    await prisma.notificationQueue.updateMany({
        where: {
            cleaningTaskId: taskId,
            staffId: { not: staffId },
            status: "sent",
        },
        data: {
            status: "expired",
        },
    });

    // 確認メッセージを送信
    if (staff.lineUserId) {
        const cleaningDateStr = format(task.cleaningDate, "M月d日（E）", { locale: ja });
        await sendConfirmation(staff.lineUserId, task.property.name, cleaningDateStr);
    }

    return true;
}

/**
 * スタッフが清掃を辞退
 */
export async function declineTask(taskId: string, staffId: string): Promise<boolean> {
    await prisma.notificationQueue.updateMany({
        where: {
            cleaningTaskId: taskId,
            staffId,
        },
        data: {
            status: "declined",
            respondedAt: new Date(),
        },
    });

    return true;
}

/**
 * スケジュールされた通知を処理
 */
export async function processScheduledNotifications(): Promise<number> {
    const now = new Date();

    const scheduledNotifications = await prisma.notificationQueue.findMany({
        where: {
            status: "scheduled",
            scheduledAt: { lte: now },
        },
        include: {
            cleaningTask: {
                include: {
                    property: true,
                },
            },
            staff: true,
        },
    });

    let sentCount = 0;

    for (const notification of scheduledNotifications) {
        const { cleaningTask, staff } = notification;

        // タスクが既に確定済みの場合はスキップ
        if (cleaningTask.status !== "pending" && cleaningTask.status !== "notifying") {
            await prisma.notificationQueue.update({
                where: { id: notification.id },
                data: { status: "expired" },
            });
            continue;
        }

        if (!staff.lineUserId) continue;

        const cleaningDateStr = format(cleaningTask.cleaningDate, "M月d日（E）", { locale: ja });

        const messageId = await sendCleaningRequest(staff.lineUserId, {
            taskId: cleaningTask.id,
            propertyName: cleaningTask.property.name,
            propertyAddress: cleaningTask.property.address,
            cleaningDate: cleaningDateStr,
            checkoutTime: cleaningTask.checkoutTime,
            cleaningFee: cleaningTask.cleaningFee,
        });

        if (messageId) {
            await prisma.notificationQueue.update({
                where: { id: notification.id },
                data: {
                    status: "sent",
                    sentAt: new Date(),
                    lineMessageId: messageId,
                },
            });

            await prisma.cleaningTask.update({
                where: { id: cleaningTask.id },
                data: {
                    status: "notifying",
                    notificationSentAt: new Date(),
                },
            });

            sentCount++;
        }
    }

    return sentCount;
}
