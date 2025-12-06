"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import {
  Save,
  MessageSquare,
  Mail,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Settings as SettingsIcon,
  Sparkles,
  ShieldCheck,
  Lock
} from "lucide-react";

interface SettingsState {
  line_channel_id: string;
  line_channel_access_token: string;
  line_channel_secret: string;
  gmail_client_id: string;
  gmail_client_secret: string;
  gmail_refresh_token: string;
  gmail_target_email: string;
  gmail_connected_email: string;
  gemini_api_key: string;
}

interface HasSettings {
  line_channel_id: boolean;
  line_channel_access_token: boolean;
  line_channel_secret: boolean;
  gmail_client_id: boolean;
  gmail_client_secret: boolean;
  gmail_refresh_token: boolean;
  gmail_target_email: boolean;
  gmail_connected_email: boolean;
  gemini_api_key: boolean;
}

export default function SettingsForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    line_channel_id: "",
    line_channel_access_token: "",
    line_channel_secret: "",
    gmail_client_id: "",
    gmail_client_secret: "",
    gmail_refresh_token: "",
    gmail_target_email: "",
    gmail_connected_email: "",
    gemini_api_key: "",
  });
  const [hasSettings, setHasSettings] = useState<HasSettings>({
    line_channel_id: false,
    line_channel_access_token: false,
    line_channel_secret: false,
    gmail_client_id: false,
    gmail_client_secret: false,
    gmail_refresh_token: false,
    gmail_target_email: false,
    gmail_connected_email: false,
    gemini_api_key: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings || {});
          setHasSettings(data.hasSettings || {});
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save settings");
      }

      // 成功メッセージ
      showToast("設定を保存しました", "success");
      router.refresh();
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast("設定の保存に失敗しました", "error");
    } finally {
      setSaving(false);
    }
  };

  // 設定済みバッジ
  const SettingStatus = ({ isSet }: { isSet: boolean }) => {
    if (isSet) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">
          <CheckCircle2 className="w-3 h-3" />
          設定済み
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">
        <AlertCircle className="w-3 h-3" />
        未設定
      </span>
    );
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
          type="button"
          onClick={() => handleSubmit()}
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

      {/* セキュリティ情報 */}
      <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3 text-sm text-emerald-800 border border-emerald-100">
        <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
        <p>
          <span className="font-bold">通信は暗号化されています</span> - すべての設定データはHTTPS/TLSで暗号化されて送受信されます。APIキーやトークンはマスク表示され、安全に保管されます。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* LINE設定 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#06C755]/10 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#06C755]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">LINE Messaging API設定</h2>
                <p className="text-sm text-slate-500">スタッフへの通知送信に使用します</p>
              </div>
            </div>
            <div className="flex gap-2">
              <SettingStatus isSet={hasSettings.line_channel_access_token} />
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-400" />
                    チャネルID
                  </label>
                  <SettingStatus isSet={hasSettings.line_channel_id} />
                </div>
                <input
                  type="text"
                  name="line_channel_id"
                  value={settings.line_channel_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755] transition-all font-mono text-sm"
                  placeholder={hasSettings.line_channel_id ? "新しいIDを入力して更新" : "LINE DevelopersのチャネルIDを入力"}
                />
                <p className="text-xs text-slate-400">組織識別に使用されます。LINE Developersのチャネル基本設定から確認できます。</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-400" />
                    チャネルアクセストークン
                  </label>
                  <SettingStatus isSet={hasSettings.line_channel_access_token} />
                </div>
                <input
                  type="text"
                  name="line_channel_access_token"
                  value={settings.line_channel_access_token}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755] transition-all font-mono text-sm"
                  placeholder={hasSettings.line_channel_access_token ? "新しいトークンを入力して更新" : "LINE Developersコンソールから取得したトークンを入力"}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    チャネルシークレット
                  </label>
                  <SettingStatus isSet={hasSettings.line_channel_secret} />
                </div>
                <input
                  type="text"
                  name="line_channel_secret"
                  value={settings.line_channel_secret}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755] transition-all font-mono text-sm"
                  placeholder={hasSettings.line_channel_secret ? "新しいシークレットを入力して更新" : "チャネルシークレットを入力"}
                />
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3 text-sm text-slate-600">
              <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Webhook URL（この値をLINE Developersに設定してください）</p>
                <code className="bg-slate-200 px-2 py-1 rounded text-xs">https://minpaku-cleaning-system.vercel.app/api/line/webhook</code>
              </div>
            </div>
          </div>
        </div>

        {/* Gmail設定 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Gmail連携</h2>
                <p className="text-sm text-slate-500">予約メールの受信と解析に使用します</p>
              </div>
            </div>
            <div className="flex gap-2">
              <SettingStatus isSet={hasSettings.gmail_refresh_token} />
            </div>
          </div>
          <div className="p-8 space-y-6">
            {hasSettings.gmail_refresh_token ? (
              // 連携済み表示
              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="font-bold text-emerald-800">Gmailと連携中</p>
                      {settings.gmail_connected_email && (
                        <p className="text-sm text-emerald-600">{settings.gmail_connected_email}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("Gmail連携を解除しますか？")) return;
                      try {
                        const res = await fetch("/api/auth/gmail/disconnect", { method: "POST" });
                        if (res.ok) {
                          showToast("Gmail連携を解除しました", "success");
                          router.refresh();
                          window.location.reload();
                        } else {
                          showToast("解除に失敗しました", "error");
                        }
                      } catch {
                        showToast("エラーが発生しました", "error");
                      }
                    }}
                    className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    連携解除
                  </button>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
                  <p>連携済みのGoogleアカウントのメールボックスから予約メールを自動取得します。</p>
                </div>
              </div>
            ) : (
              // 未連携表示
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-6">Gmailと連携することで、予約メールを自動的に取得できます</p>
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                  <a
                    href="/api/auth/gmail/connect"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Googleアカウントで連携
                  </a>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-800">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1">Gmailへのアクセス許可が必要です</p>
                    <p>連携するとこのアプリがGmailの読み取りとラベル管理の権限を取得します。</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gemini AI設定 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Gemini AI設定</h2>
                <p className="text-sm text-slate-500">メール内容の高度な解析に使用します</p>
              </div>
            </div>
            <div className="flex gap-2">
              <SettingStatus isSet={hasSettings.gemini_api_key} />
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-400" />
                  APIキー
                </label>
                <SettingStatus isSet={hasSettings.gemini_api_key} />
              </div>
              <input
                type="password"
                name="gemini_api_key"
                value={settings.gemini_api_key}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-sm"
                placeholder={hasSettings.gemini_api_key ? "新しいAPIキーを入力して更新" : "Gemini APIキーを入力"}
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
