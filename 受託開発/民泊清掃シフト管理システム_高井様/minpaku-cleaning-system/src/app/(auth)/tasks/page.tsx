"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Search,
  MoreHorizontal,
  Calendar,
  MapPin,
  Clock,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface Task {
  id: string;
  propertyId: string;
  staffId: string | null;
  cleaningDate: string;
  checkoutTime: string;
  status: string;
  cleaningFee: number;
  property: {
    id: string;
    name: string;
    address: string;
  };
  staff: {
    id: string;
    name: string;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "未割当", color: "text-slate-600", bg: "bg-slate-100", icon: AlertCircle },
  notifying: { label: "打診中", color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  confirmed: { label: "確定", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  completed: { label: "完了", color: "text-blue-600", bg: "bg-blue-50", icon: CheckCircle2 },
  cancelled: { label: "キャンセル", color: "text-red-600", bg: "bg-red-50", icon: AlertCircle },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 検索フィルター
      const matchesSearch = searchQuery === "" ||
        task.property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.staff && task.staff.name.toLowerCase().includes(searchQuery.toLowerCase()));

      // ステータスフィルター
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in space-y-8">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-800 tracking-tight">Tasks</h1>
          <p className="text-slate-500 mt-1">清掃タスクの管理・割り当て</p>
        </div>
        <Link
          href="/tasks/new"
          className="group flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-medium transition-all shadow-lg shadow-sky-200 hover:shadow-sky-300 active:scale-95 w-fit"
        >
          <Plus className="w-5 h-5" />
          <span>新規タスク作成</span>
        </Link>
      </div>

      {/* フィルター・検索バー */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="物件名やスタッフ名で検索..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border-none rounded-xl text-slate-700 focus:ring-2 focus:ring-sky-500/20 outline-none"
        >
          <option value="all">すべてのステータス</option>
          <option value="pending">未割当</option>
          <option value="notifying">打診中</option>
          <option value="confirmed">確定</option>
          <option value="completed">完了</option>
          <option value="cancelled">キャンセル</option>
        </select>
      </div>

      {/* タスクリスト */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">物件</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">日時</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">担当スタッフ</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ステータス</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    {searchQuery || statusFilter !== "all"
                      ? "該当するタスクが見つかりません"
                      : "タスクが見つかりませんでした"}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const status = statusConfig[task.status] || statusConfig.pending;
                  const StatusIcon = status.icon;

                  return (
                    <tr key={task.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="font-bold text-slate-800 text-base">{task.property.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg w-fit border border-slate-100">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="line-clamp-1">{task.property.address}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {format(new Date(task.cleaningDate), "yyyy/MM/dd (E)", { locale: ja })}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {task.checkoutTime} checkout
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {task.staff ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold border-2 border-white shadow-sm">
                              {task.staff.name.slice(0, 1)}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{task.staff.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400 italic flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            未割当
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 件数表示 */}
      <div className="text-sm text-slate-500">
        {filteredTasks.length} 件のタスク
        {(searchQuery || statusFilter !== "all") && ` (全 ${tasks.length} 件中)`}
      </div>
    </div>
  );
}
