"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
    Building2,
    Users,
    Home,
    ClipboardList,
    Settings,
    Eye,
    Plus,
    Loader2,
    Crown,
    BarChart3,
} from "lucide-react";

interface Company {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
    _count: {
        admins: number;
        properties: number;
        staff: number;
    };
}

interface Stats {
    totalCompanies: number;
    totalProperties: number;
    totalStaff: number;
    totalTasks: number;
}

export default function MasterDashboardPage() {
    const { data: session, status } = useSession();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    // マスターアカウントでない場合はリダイレクト
    useEffect(() => {
        if (status === "authenticated" && !session?.user?.isMaster) {
            redirect("/dashboard");
        }
    }, [session, status]);

    useEffect(() => {
        if (session?.user?.isMaster) {
            fetchData();
        }
    }, [session]);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/master/companies");
            if (res.ok) {
                const data = await res.json();
                setCompanies(data.companies);
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Failed to fetch companies:", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            </div>
        );
    }

    if (!session?.user?.isMaster) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* ヘッダー */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Crown className="w-8 h-8 text-amber-500" />
                            <h1 className="text-3xl font-bold text-slate-800">マスター管理</h1>
                        </div>
                        <p className="text-slate-500">全会社のアカウントを管理します</p>
                    </div>
                    <a
                        href="/register"
                        className="flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-200"
                    >
                        <Plus className="w-5 h-5" />
                        新規会社追加
                    </a>
                </div>

                {/* 統計カード */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-sky-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">登録会社数</p>
                                    <p className="text-2xl font-bold text-slate-800">{stats.totalCompanies}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Home className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">総物件数</p>
                                    <p className="text-2xl font-bold text-slate-800">{stats.totalProperties}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">総スタッフ数</p>
                                    <p className="text-2xl font-bold text-slate-800">{stats.totalStaff}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <ClipboardList className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">総タスク数</p>
                                    <p className="text-2xl font-bold text-slate-800">{stats.totalTasks}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 会社一覧 */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-slate-400" />
                            登録会社一覧
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">会社名</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">管理者</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">物件</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">スタッフ</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">状態</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">登録日</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {companies.map((company) => (
                                    <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-sky-600" />
                                                </div>
                                                <span className="font-medium text-slate-800">{company.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="px-2 py-1 bg-slate-100 rounded text-sm text-slate-600">
                                                {company.slug}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-600">{company._count.admins}</td>
                                        <td className="px-6 py-4 text-center text-slate-600">{company._count.properties}</td>
                                        <td className="px-6 py-4 text-center text-slate-600">{company._count.staff}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-bold ${company.isActive
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {company.isActive ? "有効" : "停止"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-slate-500">
                                            {new Date(company.createdAt).toLocaleDateString("ja-JP")}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="詳細">
                                                    <Eye className="w-4 h-4 text-slate-400" />
                                                </button>
                                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="設定">
                                                    <Settings className="w-4 h-4 text-slate-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {companies.length === 0 && (
                        <div className="py-12 text-center text-slate-400">
                            登録されている会社はありません
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
