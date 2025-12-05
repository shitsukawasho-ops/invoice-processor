"use client";

import React from 'react';
import {
    LayoutDashboard,
    PenTool,
    Users,
    Activity,
    MessageCircle,
    Hash,
    Clock,
    Settings,
    ChevronDown
} from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
    { label: 'ダッシュボード', icon: LayoutDashboard, active: true },
    { label: '投稿', icon: PenTool, active: false },
    { label: 'フォロワー', icon: Users, active: false },
    { label: 'エンゲージメント', icon: Activity, active: false },
    { label: '平均エンゲージメント', icon: Activity, active: false },
    { label: 'メディア', icon: MessageCircle, active: false },
    { label: 'ハッシュタグ', icon: Hash, active: false },
    { label: '時間帯', icon: Clock, active: false },
];

export const Sidebar = () => {
    return (
        <aside className="w-[240px] bg-surface border-r border-border h-screen fixed left-0 top-0 flex flex-col z-50">
            {/* Logo Area */}
            <div className="p-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>
                <span className="font-bold text-lg text-primary">SocialDog</span>
            </div>

            {/* Account Selector */}
            <div className="px-4 mb-6">
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-background cursor-pointer border border-transparent hover:border-border transition-colors">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=elonmusk" alt="User" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-text-primary">The Doggies</span>
                            <span className="text-xs text-text-muted">@thedoggies...</span>
                        </div>
                    </div>
                    <ChevronDown size={16} className="text-text-muted" />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
                {NAV_ITEMS.map((item, index) => (
                    <a
                        key={index}
                        href="#"
                        className={clsx(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            item.active
                                ? "text-primary bg-primary/10"
                                : "text-text-secondary hover:bg-background hover:text-text-primary"
                        )}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </a>
                ))}

                <div className="pt-4 mt-4 border-t border-border px-3">
                    <span className="text-xs font-semibold text-text-muted mb-2 block">フォロワー獲得</span>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:bg-background hover:text-text-primary">
                        <Users size={18} /> フォロワー獲得サマリー
                    </a>
                </div>
            </nav>

            {/* Footer Settings */}
            <div className="p-4 border-t border-border">
                <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:bg-background hover:text-text-primary">
                    <Settings size={18} /> 設定
                </a>
            </div>
        </aside>
    );
};
