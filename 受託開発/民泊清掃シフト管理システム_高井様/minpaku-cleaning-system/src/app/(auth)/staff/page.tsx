import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  User,
  Phone,
  MoreHorizontal,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  MessageCircle
} from "lucide-react";

async function getStaff() {
  const staff = await prisma.staff.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { cleaningTasks: true },
      },
    },
  });
  return staff;
}

export default async function StaffPage() {
  const staffList = await getStaff();

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in space-y-8">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-800 tracking-tight">Staff</h1>
          <p className="text-slate-500 mt-1">清掃スタッフの管理・登録</p>
        </div>
        <Link
          href="/staff/new"
          className="group flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-medium transition-all shadow-lg shadow-sky-200 hover:shadow-sky-300 active:scale-95 w-fit"
        >
          <Plus className="w-5 h-5" />
          <span>スタッフを登録</span>
        </Link>
      </div>

      {/* 検索バー */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="スタッフ名や電話番号で検索..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* スタッフグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">登録されているスタッフはいません</p>
            <p className="text-slate-400 text-sm mt-1">新しいスタッフを登録して業務を割り当てましょう</p>
          </div>
        ) : (
          staffList.map((staff) => (
            <div key={staff.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-2xl border-4 border-white shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {staff.name.slice(0, 1)}
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-sky-600 transition-colors">
                  {staff.name}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${staff.isActive
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                    }`}>
                    {staff.isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        稼働中
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        停止中
                      </>
                    )}
                  </span>
                  {staff.lineUserId ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[#06C755]/10 text-[#06C755]">
                      <MessageCircle className="w-3 h-3" />
                      LINE連携済
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-400">
                      <MessageCircle className="w-3 h-3" />
                      LINE未連携
                    </span>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{staff.phone || "電話番号未登録"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-medium text-slate-500">
                  担当タスク: {staff._count.cleaningTasks}件
                </span>
                <Link
                  href={`/staff/${staff.id}`} // 詳細ページは未実装だがリンクだけ用意
                  className="text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors"
                >
                  詳細を見る
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
