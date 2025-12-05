"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  MessageSquare,
  Mail,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Settings as SettingsIcon,
  Smartphone,
  Sparkles,
  ShieldCheck
} from "lucide-react";

interface SettingsState {
  line_channel_access_token: string;
  line_channel_secret: string;
  gmail_client_id: string;
  gmail_client_secret: string;
  gmail_refresh_token: string;
  gmail_target_email: string;
  gemini_api_key: string;
}

export default function SettingsForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    line_channel_access_token: "",
    line_channel_secret: "",
    gmail_client_id: "",
    gmail_client_secret: "",
    gmail_refresh_token: "",
    gmail_target_email: "",
    gemini_api_key: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      // 成功メッセージの代わりにトースト通知などが望ましいが、今回はアラートで代用
      alert("設定を保存しました");
      router.refresh();
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("設定の保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-sky-500" />
            システム設定
          </h1>
          <p className="text-slate-500 mt-1">
            外部サービスとの連携設定を管理します
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              設定を保存
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* LINE設定 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#06C755]/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#06C755]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">LINE Messaging API設定</h2>
              <p className="text-sm text-slate-500">スタッフへの通知送信に使用します</p>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-400" />
                  チャネルアクセストークン
                </label>
                <input
                  type="text"
                  name="line_channel_access_token"
                  value={settings.line_channel_access_token}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755] transition-all font-mono text-sm"
                  placeholder="LINE Developersコンソールから取得したトークンを入力"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  チャネルシークレット
                </label>
                <input
                  type="text"
                  name="line_channel_secret"
                  value={settings.line_channel_secret}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755] transition-all font-mono text-sm"
                  placeholder="チャネルシークレットを入力"
                />
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3 text-sm text-slate-600">
              <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <p>
                Webhook URLには <code>https://your-domain.com/api/line/webhook</code> を設定してください。<br />
                開発環境ではngrokのURLを使用します。
              </p>
            </div>
          </div>
        </div>

        {/* Gmail設定 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Gmail API設定</h2>
              <p className="text-sm text-slate-500">予約メールの受信と解析に使用します</p>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">クライアントID</label>
                <input
                  type="text"
                  name="gmail_client_id"
                  value={settings.gmail_client_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">クライアントシークレット</label>
                <input
                  type="password"
                  name="gmail_client_secret"
                  value={settings.gmail_client_secret}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">リフレッシュトークン</label>
              <input
                type="password"
                name="gmail_refresh_token"
                value={settings.gmail_refresh_token}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">監視対象メールアドレス</label>
              <input
                type="email"
                name="gmail_target_email"
                value={settings.gmail_target_email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                placeholder="例: reservation@example.com"
              />
            </div>
          </div>
        </div>

        {/* Gemini AI設定 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Gemini AI設定</h2>
              <p className="text-sm text-slate-500">メール内容の高度な解析に使用します</p>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Key className="w-4 h-4 text-slate-400" />
                APIキー
              </label>
              <input
                type="password"
                name="gemini_api_key"
                value={settings.gemini_api_key}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-sm"
                placeholder="Gemini APIキーを入力"
              />
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 flex items-start gap-3 text-sm text-indigo-800">
              <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <p>
                Google AI Studioから取得したAPIキーを設定してください。<br />
                AI解析が有効になると、メールからの情報抽出精度が大幅に向上します。
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
