import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  MapPin,
  Clock,
  User,
  Plus,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

async function getTasks() {
  const tasks = await prisma.cleaningTask.findMany({
    include: {
      property: true,
      staff: true,
    },
    orderBy: {
      cleaningDate: "asc",
    },
  });
  return tasks;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "未割当", color: "text-slate-600", bg: "bg-slate-100", icon: AlertCircle },
  notifying: { label: "打診中", color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  confirmed: { label: "確定", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  completed: { label: "完了", color: "text-blue-600", bg: "bg-blue-50", icon: CheckCircle2 },
  cancelled: { label: "キャンセル", color: "text-red-600", bg: "bg-red-50", icon: AlertCircle },
};

export default async function TasksPage() {
  const tasks = await getTasks();

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
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="物件名やスタッフ名で検索..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium">
            <Filter className="w-4 h-4" />
            フィルター
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium">
            <Calendar className="w-4 h-4" />
            日付
          </button>
        </div>
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
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    タスクが見つかりませんでした
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
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
                            {format(task.cleaningDate, "yyyy/MM/dd (E)", { locale: ja })}
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
    </div>
  );
}
