import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { acceptTask, declineTask } from "@/app/_lib/notification";
import { messagingApi } from "@line/bot-sdk";

// 全組織のLINE設定を取得し、署名検証で組織を特定
async function findOrganizationBySignature(body: string, signature: string): Promise<string | null> {
  // 全組織の設定を取得
  const allSettings = await prisma.setting.findMany({
    where: { key: "line_channel_secret" },
  });

  for (const setting of allSettings) {
    const hash = crypto
      .createHmac("sha256", setting.value)
      .update(body)
      .digest("base64");

    if (hash === signature) {
      return setting.organizationId;
    }
  }

  return null;
}

// 組織IDからLINEクライアントを取得
async function getLineClientForOrg(organizationId: string) {
  const tokenSetting = await prisma.setting.findFirst({
    where: { organizationId, key: "line_channel_access_token" },
  });

  if (!tokenSetting?.value) {
    throw new Error("LINE access token not configured for organization");
  }

  return new messagingApi.MessagingApiClient({
    channelAccessToken: tokenSetting.value,
  });
}

interface PostbackEvent {
  type: "postback";
  source: {
    userId: string;
    type: string;
  };
  postback: {
    data: string;
  };
  replyToken: string;
}

interface FollowEvent {
  type: "follow";
  source: {
    userId: string;
    type: string;
  };
  replyToken: string;
}

interface MessageEvent {
  type: "message";
  source: {
    userId: string;
    type: string;
  };
  message: {
    type: string;
    text?: string;
  };
  replyToken: string;
}

type LineEvent = PostbackEvent | FollowEvent | MessageEvent | { type: string };

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature") || "";

    // 署名検証 & 組織特定
    const organizationId = await findOrganizationBySignature(body, signature);
    if (!organizationId) {
      console.error("Invalid LINE signature or organization not found");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log(`[LINE Webhook] Organization: ${organizationId}`);

    const data = JSON.parse(body);
    const events: LineEvent[] = data.events || [];

    for (const event of events) {
      if (event.type === "postback") {
        const postbackEvent = event as PostbackEvent;
        await handlePostback(postbackEvent, organizationId);
      } else if (event.type === "follow") {
        const followEvent = event as FollowEvent;
        await handleFollow(followEvent, organizationId);
      } else if (event.type === "message") {
        const messageEvent = event as MessageEvent;
        await handleMessage(messageEvent, organizationId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LINE webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function handlePostback(event: PostbackEvent, organizationId: string) {
  const { userId } = event.source;
  const params = new URLSearchParams(event.postback.data);
  const action = params.get("action");
  const taskId = params.get("taskId");

  if (!taskId) return;

  // スタッフを特定（組織でフィルタ）
  const staff = await prisma.staff.findFirst({
    where: { lineUserId: userId, organizationId },
  });

  if (!staff) {
    console.error("Staff not found for LINE user:", userId);
    return;
  }

  if (action === "accept") {
    const success = await acceptTask(taskId, staff.id);

    if (!success) {
      // タスクの状態を確認して適切なメッセージを返す
      const task = await prisma.cleaningTask.findUnique({
        where: { id: taskId },
        include: {
          property: true,
          staff: true
        },
      });

      if (task?.staffId && task.staffId !== staff.id) {
        // 他のスタッフに既に割り当てられている
        await replyMessage(event.replyToken, organizationId, [
          {
            type: "flex",
            altText: "この案件は既に埋まっています",
            contents: {
              type: "bubble",
              header: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "⚠️ 募集終了",
                    weight: "bold",
                    size: "lg",
                    color: "#FFFFFF",
                    align: "center"
                  }
                ],
                backgroundColor: "#F59E0B",
                paddingAll: "20px"
              },
              body: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: task.property.name,
                    weight: "bold",
                    size: "lg",
                    wrap: true,
                    color: "#111827",
                    align: "center"
                  },
                  {
                    type: "separator",
                    margin: "lg"
                  },
                  {
                    type: "text",
                    text: "申し訳ありません、この案件は既に他のスタッフが受諾済みです。",
                    wrap: true,
                    size: "sm",
                    color: "#6B7280",
                    margin: "lg",
                    align: "center"
                  },
                  {
                    type: "text",
                    text: "また次回の依頼をお待ちください🙏",
                    wrap: true,
                    size: "sm",
                    color: "#6B7280",
                    margin: "md",
                    align: "center"
                  }
                ]
              }
            }
          }
        ]);
      } else if (!task) {
        // タスクが存在しない
        await replyMessage(event.replyToken, organizationId, [
          {
            type: "text",
            text: "申し訳ありません、この案件は見つかりませんでした。"
          }
        ]);
      }
    }
  } else if (action === "decline") {
    await declineTask(taskId, staff.id);

    // 辞退確認メッセージを送信
    await replyMessage(event.replyToken, organizationId, [
      {
        type: "text",
        text: "この案件を辞退しました。\nまた次回の依頼をお待ちください🙏"
      }
    ]);
  }
}

async function handleFollow(event: FollowEvent, organizationId: string) {
  const { userId } = event.source;
  console.log(`New LINE follower: ${userId} (org: ${organizationId})`);

  try {
    // 既存のスタッフか確認（この組織内で）
    const existingStaff = await prisma.staff.findFirst({
      where: { lineUserId: userId, organizationId },
    });

    if (existingStaff) {
      // 既に登録済みの場合
      await replyMessage(event.replyToken, organizationId, [
        {
          type: "text",
          text: `${existingStaff.name}さん、おかえりなさい！\n\n清掃依頼の通知はこちらのLINEでお送りします。よろしくお願いいたします🏠✨`,
        },
      ]);
      return;
    }

    // 新規登録フローを開始（組織IDを保存）
    await prisma.lineRegistration.upsert({
      where: { lineUserId: userId },
      update: {
        organizationId,
        state: "waiting_name",
        name: null,
        nameReading: null,
        phone: null
      },
      create: {
        organizationId,
        lineUserId: userId,
        state: "waiting_name"
      },
    });

    // 挨拶メッセージを送信
    await replyMessage(event.replyToken, organizationId, [
      {
        type: "text",
        text: "🏠 民泊清掃管理システムへようこそ！\n\nスタッフ登録を行います。\n以下の情報を順番に入力してください。\n\nまず、【お名前（漢字）】を入力してください。\n\n例：山田 太郎",
      },
    ]);
  } catch (error) {
    console.error("Error handling follow event:", error);
  }
}

async function handleMessage(event: MessageEvent, organizationId: string) {
  const { userId } = event.source;
  const messageText = event.message.text?.trim();

  if (!messageText || event.message.type !== "text") {
    return;
  }

  console.log(`Message from ${userId}: ${messageText}`);

  try {
    // 登録中のユーザーか確認
    const registration = await prisma.lineRegistration.findUnique({
      where: { lineUserId: userId },
    });

    if (!registration || registration.state === "completed") {
      // 既にスタッフ登録済みか確認
      const staff = await prisma.staff.findFirst({
        where: { lineUserId: userId, organizationId },
      });

      if (staff) {
        await replyMessage(event.replyToken, organizationId, [
          {
            type: "text",
            text: `${staff.name}さん、メッセージありがとうございます！\n\n清掃依頼があればこちらから通知しますね🏠`,
          },
        ]);
      }
      return;
    }

    // 登録フローに応じて処理
    switch (registration.state) {
      case "waiting_name":
        await handleNameInput(event, registration, messageText, organizationId);
        break;
      case "waiting_reading":
        await handleReadingInput(event, registration, messageText, organizationId);
        break;
      case "waiting_phone":
        await handlePhoneInput(event, registration, messageText, organizationId);
        break;
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
}

async function handleNameInput(event: MessageEvent, registration: any, name: string, organizationId: string) {
  // 名前を保存して次のステップへ
  await prisma.lineRegistration.update({
    where: { id: registration.id },
    data: { name, state: "waiting_reading" },
  });

  await replyMessage(event.replyToken, organizationId, [
    {
      type: "text",
      text: `ありがとうございます！\n「${name}」さんですね。\n\n次に、【ふりがな】を入力してください。\n\n例：やまだ たろう`,
    },
  ]);
}

async function handleReadingInput(event: MessageEvent, registration: any, reading: string, organizationId: string) {
  // ふりがなを保存して次のステップへ
  await prisma.lineRegistration.update({
    where: { id: registration.id },
    data: { nameReading: reading, state: "waiting_phone" },
  });

  await replyMessage(event.replyToken, organizationId, [
    {
      type: "text",
      text: `「${reading}」さんですね。\n\n最後に、【電話番号】を入力してください。\n\n例：090-1234-5678`,
    },
  ]);
}

async function handlePhoneInput(event: MessageEvent, registration: any, phone: string, organizationId: string) {
  const { lineUserId } = registration;
  const name = registration.name || "名無し";
  const nameReading = registration.nameReading || "";

  try {
    // スタッフを作成（登録時に保存した組織IDを使用）
    const targetOrgId = registration.organizationId || organizationId;

    await prisma.staff.create({
      data: {
        organizationId: targetOrgId,
        name,
        lineUserId,
        phone,
        isActive: true,
      },
    });

    // 登録を完了に更新
    await prisma.lineRegistration.update({
      where: { id: registration.id },
      data: { phone, state: "completed" },
    });

    await replyMessage(event.replyToken, organizationId, [
      {
        type: "text",
        text: `🎉 スタッフ登録が完了しました！\n\n【登録情報】\n・お名前：${name}\n・ふりがな：${nameReading}\n・電話番号：${phone}\n\n清掃依頼がありましたらこちらのLINEでお知らせします。よろしくお願いいたします🏠✨`,
      },
    ]);

    console.log(`New staff registered: ${name} (${lineUserId}) for org ${targetOrgId}`);
  } catch (error) {
    console.error("Error creating staff:", error);
    await replyMessage(event.replyToken, organizationId, [
      {
        type: "text",
        text: "登録中にエラーが発生しました。お手数ですが、もう一度お試しください。",
      },
    ]);
  }
}

async function replyMessage(replyToken: string, organizationId: string, messages: any[]) {
  try {
    const client = await getLineClientForOrg(organizationId);
    await client.replyMessage({ replyToken, messages });
  } catch (error) {
    console.error("Error sending reply message:", error);
  }
}

// GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
