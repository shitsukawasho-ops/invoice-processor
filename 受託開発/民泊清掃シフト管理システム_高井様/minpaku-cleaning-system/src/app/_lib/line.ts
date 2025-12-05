import { Client, FlexMessage, FlexBubble, ClientConfig } from "@line/bot-sdk";
import prisma from "@/lib/prisma";

// データベースから設定を取得するヘルパー
async function getLineSettings(): Promise<{ channelAccessToken: string; channelSecret: string }> {
    const settings = await prisma.setting.findMany({
        where: {
            key: {
                in: ["line_channel_access_token", "line_channel_secret"],
            },
        },
    });

    const tokenSetting = settings.find((s) => s.key === "line_channel_access_token");
    const secretSetting = settings.find((s) => s.key === "line_channel_secret");

    return {
        channelAccessToken: tokenSetting?.value || process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
        channelSecret: secretSetting?.value || process.env.LINE_CHANNEL_SECRET || "",
    };
}

// LINEクライアントを動的に生成
async function getLineClient(): Promise<Client> {
    const settings = await getLineSettings();
    const config: ClientConfig = {
        channelAccessToken: settings.channelAccessToken,
        channelSecret: settings.channelSecret,
    };
    return new Client(config);
}

interface CleaningTaskInfo {
    taskId: string;
    propertyName: string;
    propertyAddress: string;
    cleaningDate: string;
    checkoutTime: string;
    cleaningFee: number;
}

export function createCleaningRequestMessage(task: CleaningTaskInfo): FlexMessage {
    const bubble: FlexBubble = {
        type: "bubble",
        header: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: "✨新規清掃依頼✨",
                    weight: "bold",
                    size: "lg",
                    color: "#FFFFFF",
                    align: "center"
                }
            ],
            backgroundColor: "#0ea5e9",
            paddingAll: "20px"
        },
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: task.propertyName,
                    weight: "bold",
                    size: "xl",
                    wrap: true,
                    color: "#111827",
                    align: "center"
                },
                {
                    type: "separator",
                    margin: "lg"
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "lg",
                    spacing: "sm",
                    contents: [
                        {
                            type: "box",
                            layout: "baseline",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "text",
                                    text: "📅",
                                    flex: 1,
                                    size: "sm",
                                    align: "center"
                                },
                                {
                                    type: "text",
                                    text: task.cleaningDate,
                                    weight: "bold",
                                    size: "sm",
                                    flex: 6,
                                    color: "#4B5563"
                                }
                            ]
                        },
                        {
                            type: "box",
                            layout: "baseline",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "text",
                                    text: "⏰",
                                    flex: 1,
                                    size: "sm",
                                    align: "center"
                                },
                                {
                                    type: "text",
                                    text: `${task.checkoutTime}〜`,
                                    weight: "bold",
                                    size: "sm",
                                    flex: 6,
                                    color: "#4B5563"
                                }
                            ]
                        },
                        {
                            type: "box",
                            layout: "baseline",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "text",
                                    text: "📍",
                                    flex: 1,
                                    size: "sm",
                                    align: "center"
                                },
                                {
                                    type: "text",
                                    text: task.propertyAddress,
                                    size: "xs",
                                    flex: 6,
                                    color: "#6B7280",
                                    wrap: true
                                }
                            ]
                        }
                    ]
                },
                {
                    type: "separator",
                    margin: "xl"
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "xl",
                    contents: [
                        {
                            type: "text",
                            text: "報酬金額",
                            size: "xs",
                            color: "#6B7280",
                            align: "center"
                        },
                        {
                            type: "text",
                            text: `¥${task.cleaningFee.toLocaleString()}`,
                            size: "3xl",
                            weight: "bold",
                            color: "#0ea5e9",
                            align: "center",
                            margin: "xs"
                        }
                    ]
                }
            ]
        },
        footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
                {
                    type: "button",
                    style: "primary",
                    height: "sm",
                    action: {
                        type: "postback",
                        label: "受諾する",
                        data: `action=accept&taskId=${task.taskId}`,
                        displayText: "この清掃を受諾します"
                    },
                    color: "#0ea5e9"
                },
                {
                    type: "button",
                    style: "secondary",
                    height: "sm",
                    action: {
                        type: "postback",
                        label: "辞退する",
                        data: `action=decline&taskId=${task.taskId}`,
                        displayText: "今回は辞退します"
                    },
                    color: "#E5E7EB"
                }
            ]
        }
    };

    return { type: "flex", altText: `清掃依頼: ${task.propertyName} (${task.cleaningDate})`, contents: bubble };
}

export async function sendCleaningRequest(lineUserId: string, task: CleaningTaskInfo): Promise<string | null> {
    try {
        const client = await getLineClient();
        const message = createCleaningRequestMessage(task);
        console.log(`[LINE] Sending cleaning request to ${lineUserId} for task ${task.taskId}`);
        const result = await client.pushMessage(lineUserId, message);
        console.log(`[LINE] Message sent successfully:`, result);
        // LINE SDKの仕様上、pushMessageはメッセージIDを返さないため、成功時は適当なIDを返すかnullを返す
        // ここではログ用にタイムスタンプベースのIDを生成して返す（DB保存用）
        return `msg-${Date.now()}`;
    } catch (error) {
        console.error("[LINE] Failed to send message:", error);
        return null;
    }
}

export function createConfirmationMessage(propertyName: string, cleaningDate: string): FlexMessage {
    const bubble: FlexBubble = {
        type: "bubble",
        header: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: "✅ 清掃受諾完了",
                    weight: "bold",
                    size: "lg",
                    color: "#FFFFFF",
                    align: "center"
                }
            ],
            backgroundColor: "#0ea5e9",
            paddingAll: "20px"
        },
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: propertyName,
                    weight: "bold",
                    size: "xl",
                    wrap: true,
                    color: "#111827",
                    align: "center"
                },
                {
                    type: "separator",
                    margin: "lg"
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "lg",
                    spacing: "sm",
                    contents: [
                        {
                            type: "text",
                            text: "以下の日時で確定しました",
                            size: "sm",
                            color: "#6B7280",
                            align: "center",
                            margin: "md"
                        },
                        {
                            type: "text",
                            text: cleaningDate,
                            weight: "bold",
                            size: "lg",
                            color: "#0ea5e9",
                            align: "center",
                            margin: "sm"
                        },
                        {
                            type: "text",
                            text: "当日よろしくお願いいたします✨",
                            size: "sm",
                            color: "#4B5563",
                            align: "center",
                            margin: "xl"
                        }
                    ]
                }
            ]
        }
    };
    return { type: "flex", altText: "清掃を受諾しました", contents: bubble };
}

export async function sendConfirmation(lineUserId: string, propertyName: string, cleaningDate: string): Promise<void> {
    try {
        const client = await getLineClient();
        const message = createConfirmationMessage(propertyName, cleaningDate);
        await client.pushMessage(lineUserId, message);
    } catch (error) {
        console.error("[LINE] Failed to send confirmation:", error);
    }
}

// 設定のバリデーション用
export async function validateLineSettings(): Promise<{ valid: boolean; error?: string }> {
    try {
        const settings = await getLineSettings();
        if (!settings.channelAccessToken) {
            return { valid: false, error: "Channel Access Tokenが設定されていません" };
        }
        if (!settings.channelSecret) {
            return { valid: false, error: "Channel Secretが設定されていません" };
        }
        return { valid: true };
    } catch (error) {
        return { valid: false, error: "設定の読み込みに失敗しました" };
    }
}

// 設定を取得（外部からアクセス用）
export { getLineSettings };
