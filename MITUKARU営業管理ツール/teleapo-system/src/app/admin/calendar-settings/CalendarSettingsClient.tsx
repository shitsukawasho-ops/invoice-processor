'use client';

import { useState, useEffect } from 'react';
import { Save, Calendar, Video, Mail, ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface CalendarSettings {
    googleCalendarId: string;
    googleConnected: boolean;
    defaultMeetingDuration: number;
    businessHoursStart: string;
    businessHoursEnd: string;
    emailSubjectTemplate: string;
}

export default function CalendarSettingsClient() {
    const [settings, setSettings] = useState<CalendarSettings>({
        googleCalendarId: '',
        googleConnected: false,
        defaultMeetingDuration: 30,
        businessHoursStart: '09:00',
        businessHoursEnd: '18:00',
        emailSubjectTemplate: '{company_name}様とのWeb会議のご案内',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Load settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await fetch('/api/admin/calendar-settings');
                if (response.ok) {
                    const data = await response.json();
                    if (data.settings) {
                        setSettings(data.settings);
                    }
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);

        try {
            const response = await fetch('/api/admin/calendar-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleGoogleConnect = () => {
        // TODO: Implement Google OAuth flow
        // For now, just show a message
        alert('Google OAuth認証フローは実装中です。\n\n環境変数で以下を設定してください：\n- GOOGLE_CLIENT_ID\n- GOOGLE_CLIENT_SECRET\n- GOOGLE_REFRESH_TOKEN\n- GOOGLE_CALENDAR_ID');
    };

    return (
        <div className="calendar-settings">
            {/* Google Calendar Connection */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon google">
                        <Calendar size={24} />
                    </div>
                    <div className="settings-card-title">
                        <h3>Googleカレンダー連携</h3>
                        <p>商談担当者の空きスケジュールを取得するためにGoogleカレンダーと連携します</p>
                    </div>
                </div>

                <div className="settings-card-body">
                    {settings.googleConnected ? (
                        <div className="connection-status connected">
                            <CheckCircle size={20} />
                            <span>Googleカレンダーに接続済み</span>
                        </div>
                    ) : (
                        <div className="connection-status disconnected">
                            <AlertCircle size={20} />
                            <span>未接続</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">カレンダーID</label>
                        <input
                            type="text"
                            className="form-input"
                            value={settings.googleCalendarId}
                            onChange={(e) => setSettings({ ...settings, googleCalendarId: e.target.value })}
                            placeholder="primary または xxx@group.calendar.google.com"
                        />
                        <small className="form-hint">
                            通常は &quot;primary&quot; または個別のカレンダーIDを指定
                        </small>
                    </div>

                    <button
                        className="btn btn-google"
                        onClick={handleGoogleConnect}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Googleアカウントと連携
                    </button>
                </div>
            </div>

            {/* Meeting Settings */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon meeting">
                        <Video size={24} />
                    </div>
                    <div className="settings-card-title">
                        <h3>Web会議設定</h3>
                        <p>Google Meetの発行設定を行います</p>
                    </div>
                </div>

                <div className="settings-card-body">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">デフォルト会議時間</label>
                            <select
                                className="form-select"
                                value={settings.defaultMeetingDuration}
                                onChange={(e) => setSettings({ ...settings, defaultMeetingDuration: parseInt(e.target.value) })}
                            >
                                <option value={15}>15分</option>
                                <option value={30}>30分</option>
                                <option value={45}>45分</option>
                                <option value={60}>60分</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">営業時間（開始）</label>
                            <input
                                type="time"
                                className="form-input"
                                value={settings.businessHoursStart}
                                onChange={(e) => setSettings({ ...settings, businessHoursStart: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">営業時間（終了）</label>
                            <input
                                type="time"
                                className="form-input"
                                value={settings.businessHoursEnd}
                                onChange={(e) => setSettings({ ...settings, businessHoursEnd: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Settings */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon email">
                        <Mail size={24} />
                    </div>
                    <div className="settings-card-title">
                        <h3>メール通知設定</h3>
                        <p>顧客へ送信する招待メールの設定</p>
                    </div>
                </div>

                <div className="settings-card-body">
                    <div className="form-group">
                        <label className="form-label">メール件名テンプレート</label>
                        <input
                            type="text"
                            className="form-input"
                            value={settings.emailSubjectTemplate}
                            onChange={(e) => setSettings({ ...settings, emailSubjectTemplate: e.target.value })}
                        />
                        <small className="form-hint">
                            利用可能な変数: {'{company_name}'}, {'{contact_name}'}, {'{date}'}, {'{time}'}
                        </small>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="settings-actions">
                {saved && (
                    <div className="success-message">
                        <CheckCircle size={16} />
                        設定を保存しました
                    </div>
                )}
                <button
                    className="btn btn-primary btn-lg"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <Loader2 size={18} className="spin" />
                            保存中...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            設定を保存
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
