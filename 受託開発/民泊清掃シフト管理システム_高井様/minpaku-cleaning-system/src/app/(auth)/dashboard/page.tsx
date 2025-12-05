import prisma from "@/lib/prisma";
import { format, startOfDay, endOfDay, addDays } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  User,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp
} from "lucide-react";

async function getDashboardData() {
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfNextWeek = endOfDay(addDays(today, 7));

  const [
    todayTasks,
    upcomingTasks,
    pendingCount,
    notifyingCount,
    confirmedCount,
    totalProperties,
    totalStaff,
  ] = await Promise.all([
    prisma.cleaningTask.findMany({
      where: {
        cleaningDate: {
          gte: startOfToday,
          lte: endOfDay(today),
        },
      },
      include: {
        property: true,
        staff: true,
      },
      orderBy: { checkoutTime: "asc" },
    }),
    prisma.cleaningTask.findMany({
      where: {
        cleaningDate: {
          gt: endOfDay(today),
          lte: endOfNextWeek,
        },
      },
      include: {
        property: true,
        staff: true,
      },
      orderBy: { cleaningDate: "asc" },
    }),
    prisma.cleaningTask.count({ where: { status: "pending" } }),
    prisma.cleaningTask.count({ where: { status: "notifying" } }),
    prisma.cleaningTask.count({ where: { status: "confirmed" } }),
    prisma.property.count({ where: { isActive: true } }),
    prisma.staff.count({ where: { isActive: true } }),
  ]);

  return {
    todayTasks,
    upcomingTasks,
    stats: {
      pending: pendingCount,
      notifying: notifyingCount,
      confirmed: confirmedCount,
      properties: totalProperties,
      staff: totalStaff,
    },
  };
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "未割当", color: "text-slate-600", bg: "bg-slate-100", icon: AlertCircle },
  notifying: { label: "打診中", color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  confirmed: { label: "確定", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  completed: { label: "完了", color: "text-blue-600", bg: "bg-blue-50", icon: CheckCircle2 },
  cancelled: { label: "キャンセル", color: "text-red-600", bg: "bg-red-50", icon: AlertCircle },
};

export default async function DashboardPage() {
  const { todayTasks, upcomingTasks, stats } = await getDashboardData();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(), "yyyy年M月d日（E）", { locale: ja })}
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="group flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-medium transition-all shadow-lg shadow-sky-200 hover:shadow-sky-300 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>タスク作成</span>
        </Link>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          label="未割当タスク"
          value={stats.pending}
          icon={AlertCircle}
          color="text-slate-600"
          bg="bg-slate-50"
          trend="要対応"
        />
        <StatCard
          label="打診中"
          value={stats.notifying}
          icon={Clock}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatCard
          label="確定済み"
          value={stats.confirmed}
          icon={CheckCircle2}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          label="登録物件"
          value={stats.properties}
          icon={Home}
          color="text-sky-600"
          bg="bg-sky-50"
        />
        <StatCard
          label="スタッフ"
          value={stats.staff}
          icon={User}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 今日のタスク */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-sky-500" />
              今日の清掃タスク
            </h2>
            <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
              {todayTasks.length}件
            </span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">今日のタスクはありません</p>
              <p className="text-slate-400 text-sm mt-1">ゆっくりコーヒーでも飲みましょう ☕</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {todayTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* 今後のタスク */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-5 border-b border-slate-50">
            <h2 className="text-lg font-bold font-display text-slate-800">今後7日間の予定</h2>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              予定はありません
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {upcomingTasks.map((task) => (
                <UpcomingTaskRow key={task.id} task={task} />
              ))}
            </div>
          )}

          <div className="p-4 border-t border-slate-50 bg-slate-50/50">
            <Link
              href="/tasks"
              className="flex items-center justify-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
            >
              すべてのタスクを見る
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, trend }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold font-display text-slate-800 mt-1">{value}</p>
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: any }) {
  const status = statusConfig[task.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
          🏠
        </div>
        <div>
          <div className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
            {task.property.name}
          </div>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            チェックアウト {task.checkoutTime}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {task.staff ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
              {task.staff.name.slice(0, 1)}
            </div>
            <span className="text-sm font-medium text-slate-600">{task.staff.name}</span>
          </div>
        ) : (
          <span className="text-sm text-slate-400 italic">未割当</span>
        )}

        <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${status.bg} ${status.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.label}
        </span>
      </div>
    </Link>
  );
}

function UpcomingTaskRow({ task }: { task: any }) {
  const status = statusConfig[task.status] || statusConfig.pending;

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
    >
      <div className="flex items-center gap-4">
        <div className="text-center min-w-[50px] bg-slate-50 rounded-lg p-1 border border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase">
            {format(task.cleaningDate, "MMM", { locale: ja })}
          </div>
          <div className="text-lg font-bold text-slate-800 font-display">
            {format(task.cleaningDate, "d")}
          </div>
        </div>
        <div>
          <div className="font-medium text-slate-800 text-sm group-hover:text-sky-600 transition-colors line-clamp-1">
            {task.property.name}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {task.checkoutTime} checkout
          </div>
        </div>
      </div>

      <div className={`w-2 h-2 rounded-full ${status.color.replace('text-', 'bg-').replace('600', '500')}`} />
    </Link>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
