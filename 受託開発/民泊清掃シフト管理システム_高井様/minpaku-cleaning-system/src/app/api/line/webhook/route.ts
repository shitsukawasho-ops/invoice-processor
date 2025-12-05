import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { acceptTask, declineTask } from "@/app/_lib/notification";
import { getLineSettings } from "@/app/_lib/line";

async function validateSignature(body: string, signature: string): Promise<boolean> {
  const settings = await getLineSettings();
  const channelSecret = settings.channelSecret;

  if (!channelSecret) {
    console.warn("LINE Channel Secret is not configured.");
    return false;
  }

  const hash = crypto
    .createHmac("sha256", channelSecret)
    .update(body)
    .digest("base64");
  return hash === signature;
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

type LineEvent = PostbackEvent | FollowEvent | { type: string };

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature") || "";

    // 署名検証
    const isValid = await validateSignature(body, signature);
    if (!isValid) {
      console.error("Invalid LINE signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    const events: LineEvent[] = data.events || [];

    for (const event of events) {
      if (event.type === "postback") {
        const postbackEvent = event as PostbackEvent;
        await handlePostback(postbackEvent);
      } else if (event.type === "follow") {
        const followEvent = event as FollowEvent;
        await handleFollow(followEvent);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LINE webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function handlePostback(event: PostbackEvent) {
  const { userId } = event.source;
  const params = new URLSearchParams(event.postback.data);
  const action = params.get("action");
  const taskId = params.get("taskId");

  if (!taskId) return;

  // スタッフを特定
  const staff = await prisma.staff.findUnique({
    where: { lineUserId: userId },
  });

  if (!staff) {
    console.error("Staff not found for LINE user:", userId);
    return;
  }

  if (action === "accept") {
    await acceptTask(taskId, staff.id);
  } else if (action === "decline") {
    await declineTask(taskId, staff.id);
  }
}

async function handleFollow(event: FollowEvent) {
  const { userId } = event.source;
  console.log("New LINE follower:", userId);

  // ログファイルに書き込み（デバッグ用）
  const fs = require('fs');
  fs.appendFileSync('/tmp/line_follower.log', `New LINE follower: ${userId}\n`);
}

// GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
