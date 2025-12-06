import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import TaskActions from "./TaskActions";
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  User,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building2
} from "lucide-react";

async function getTask(id: string) {
  const task = await prisma.cleaningTask.findUnique({
    where: { id },
    include: {
      property: true,
      staff: true,
      notifications: {
        orderBy: { sentAt: "desc" },
      },
    },
  });

  if (!task) return null;

  // 候補スタッフを取得（同じ物件を担当しているスタッフ）
  const candidateStaff = await prisma.staff.findMany({
    where: {
      isActive: true,
      propertyAssignments: {
        some: {
          propertyId: task.propertyId,
        },
      },
    },
  });

  return { task, candidateStaff };
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "未割当", color: "text-slate-600", bg: "bg-slate-100", icon: AlertCircle },
  notifying: { label: "打診中", color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  confirmed: { label: "確定", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  completed: { label: "完了", color: "text-blue-600", bg: "bg-blue-50", icon: CheckCircle2 },
  cancelled: { label: "キャンセル", color: "text-red-600", bg: "bg-red-50", icon: AlertCircle },
};

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getTask(id);

  if (!data) {
    notFound();
  }

  const { task, candidateStaff } = data;
  const status = statusConfig[task.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in space-y-8">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link
          href="/tasks"
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-display text-slate-800 tracking-tight">
              Task Details
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${status.bg} ${status.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* 左カラム：物件情報・担当スタッフ */}
        <div className="space-y-6 flex flex-col h-full">
          {/* 物件情報カード */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-shrink-0">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-400" />
              <h2 className="font-bold text-slate-700">物件情報</h2>
            </div>
            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{task.property.name}</h3>
                <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-2 rounded-lg inline-flex">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">{task.property.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <InfoItem
                  icon={Calendar}
                  label="清掃日"
                  value={format(task.cleaningDate, "yyyy年M月d日（E）", { locale: ja })}
                />
                <InfoItem
                  icon={Clock}
                  label="チェックアウト"
                  value={`${task.checkoutTime} 以降`}
                />
                <InfoItem
                  icon={Clock}
                  label="所要時間"
                  value={`${task.property.cleaningDurationMinutes}分`}
                />
                <InfoItem
                  icon={DollarSign}
                  label="清掃報酬"
                  value={`¥${task.cleaningFee.toLocaleString()}`}
                  valueColor="text-emerald-600 font-bold"
                />
              </div>
            </div>
          </div>

          {/* 担当スタッフカード */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-400" />
              <h2 className="font-bold text-slate-700">担当スタッフ</h2>
            </div>
            <div className="p-6 flex-grow flex flex-col justify-center">
              {task.staff ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl border-4 border-white shadow-sm">
                    {task.staff.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xl mb-1">{task.staff.name}</div>
                    <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full inline-block">
                      {task.staff.phone || "電話番号未登録"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-200 h-full flex flex-col items-center justify-center">
                  <User className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium mb-1">未割り当て</p>
                  <p className="text-slate-400 text-xs">
                    右側のアクションパネルから<br />スタッフを募集してください
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右カラム：アクション・通知履歴 */}
        <div className="space-y-6 flex flex-col h-full">
          {/* アクションパネル */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-shrink-0">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-slate-400" />
              <h2 className="font-bold text-slate-700">アクション</h2>
            </div>
            <div className="p-6">
              <TaskActions task={task} candidateStaff={candidateStaff} />
            </div>
          </div>

          {/* 通知履歴 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-slate-400" />
              <h2 className="font-bold text-slate-700">通知履歴</h2>
            </div>
            <div className="p-0 flex-grow">
              {task.notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm h-full flex items-center justify-center">
                  履歴はありません
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {task.notifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${notification.status === "sent" ? "bg-blue-50 text-blue-600" :
                          notification.status === "failed" ? "bg-red-50 text-red-600" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                          {notification.status}
                        </span>
                        <p className="text-sm text-slate-600">
                          {notification.status === 'sent' && '通知を送信しました'}
                          {notification.status === 'accepted' && 'スタッフが受諾しました'}
                          {notification.status === 'declined' && 'スタッフが辞退しました'}
                          {notification.status === 'scheduled' && '送信予定'}
                          {notification.status === 'expired' && '期限切れ'}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {notification.sentAt ? format(notification.sentAt, "yyyy/MM/dd HH:mm") : "未送信"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, valueColor = "text-slate-800" }: any) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className={`text-lg font-medium ${valueColor}`}>{value}</div>
    </div>
  );
}
