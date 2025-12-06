"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  Users,
  Settings,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle
} from "lucide-react";

const navigation = [
  { name: "ダッシュボード", href: "/dashboard", icon: LayoutDashboard },
  { name: "清掃タスク", href: "/tasks", icon: CalendarCheck },
  { name: "物件管理", href: "/properties", icon: Building2 },
  { name: "スタッフ管理", href: "/staff", icon: Users },
  { name: "設定", href: "/settings", icon: Settings },
  { name: "ヘルプ", href: "/help", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`flex h-screen flex-col bg-white border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 transition-all duration-300 ${isCollapsed ? "w-20" : "w-72"}`}>
      <div className="flex h-20 items-center justify-between px-4 border-b border-slate-50">
        <div className={`flex items-center gap-2 text-sky-500 ${isCollapsed ? "justify-center w-full" : ""}`}>
          <Sparkles className="w-6 h-6 fill-sky-500 shrink-0" />
          {!isCollapsed && (
            <h1 className="text-xl font-bold font-display tracking-tight text-slate-800">
              Minpaku<span className="text-sky-500">Clean</span>
            </h1>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-8">
        {!isCollapsed && (
          <div className="mb-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu
          </div>
        )}
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`group flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${isCollapsed ? "justify-center" : ""} ${isActive
                ? "bg-sky-50 text-sky-700 shadow-sm shadow-sky-100"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <Icon
                className={`h-5 w-5 transition-colors ${isCollapsed ? "" : "mr-3.5"} ${isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
              />
              {!isCollapsed && (
                <>
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-50 space-y-2">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={isCollapsed ? "ログアウト" : undefined}
          className={`flex w-full items-center rounded-xl px-4 py-3.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group ${isCollapsed ? "justify-center" : ""}`}
        >
          <LogOut className={`h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors ${isCollapsed ? "" : "mr-3.5"}`} />
          {!isCollapsed && "ログアウト"}
        </button>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-200 ${isCollapsed ? "justify-center" : ""}`}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 mr-3.5" />
              折りたたむ
            </>
          )}
        </button>
      </div>
    </div>
  );
}
