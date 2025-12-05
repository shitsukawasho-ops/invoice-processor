import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 設定キーの定義
const SETTING_KEYS = {
  LINE_CHANNEL_ACCESS_TOKEN: "line_channel_access_token",
  LINE_CHANNEL_SECRET: "line_channel_secret",
  GMAIL_CLIENT_ID: "gmail_client_id",
  GMAIL_CLIENT_SECRET: "gmail_client_secret",
  GMAIL_REFRESH_TOKEN: "gmail_refresh_token",
  GMAIL_TARGET_EMAIL: "gmail_target_email",
  GEMINI_API_KEY: "gemini_api_key",
} as const;

const VALID_KEYS = Object.values(SETTING_KEYS);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.setting.findMany();

  // キーと値のオブジェクトに変換（機密情報はマスク）
  const settingsMap: Record<string, string> = {};
  settings.forEach((setting) => {
    // トークン類は最後の4文字以外をマスク
    if (setting.key.includes("token") || setting.key.includes("secret") || setting.key.includes("key")) {
      const value = setting.value;
      if (value.length > 4) {
        settingsMap[setting.key] = "•".repeat(value.length - 4) + value.slice(-4);
      } else {
        settingsMap[setting.key] = "••••";
      }
    } else {
      settingsMap[setting.key] = setting.value;
    }
  });

  // 設定済みかどうかのフラグも含める
  const hasSettings: Record<string, boolean> = {};
  VALID_KEYS.forEach((key) => {
    hasSettings[key] = settings.some((s) => s.key === key && s.value.length > 0);
  });

  return NextResponse.json({ settings: settingsMap, hasSettings });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // 複数設定の一括保存に対応
    // body が { key, value } 形式の場合は単一保存
    // body が { line_channel_access_token: "...", ... } 形式の場合は一括保存
    if (body.key && typeof body.value === "string") {
      // 単一設定の保存（レガシー対応）
      const { key, value } = body;
      if (!VALID_KEYS.includes(key)) {
        return NextResponse.json({ error: "無効な設定キーです" }, { status: 400 });
      }

      if (!value || value.trim() === "") {
        await prisma.setting.deleteMany({ where: { key } });
        return NextResponse.json({ success: true, deleted: true });
      }

      const setting = await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });

      return NextResponse.json({ success: true, setting: { key: setting.key } });
    }

    // 一括保存
    const savedKeys: string[] = [];
    for (const [key, value] of Object.entries(body)) {
      if (!VALID_KEYS.includes(key as any)) {
        continue; // 無効なキーはスキップ
      }

      const strValue = String(value || "");

      // マスクされた値（••••で始まる）は更新しない
      if (strValue.startsWith("•")) {
        continue;
      }

      if (strValue.trim() === "") {
        // 空文字の場合は削除
        await prisma.setting.deleteMany({ where: { key } });
      } else {
        // upsert で作成または更新
        await prisma.setting.upsert({
          where: { key },
          update: { value: strValue },
          create: { key, value: strValue },
        });
        savedKeys.push(key);
      }
    }

    return NextResponse.json({ success: true, savedKeys });
  } catch (error) {
    console.error("Error saving setting:", error);
    return NextResponse.json(
      { error: "設定の保存に失敗しました" },
      { status: 500 }
    );
  }
}

