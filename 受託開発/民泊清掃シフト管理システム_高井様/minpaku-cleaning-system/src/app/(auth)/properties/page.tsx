import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  MoreHorizontal,
  Search,
  Plus
} from "lucide-react";

async function getProperties() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { cleaningTasks: true },
      },
    },
  });
  return properties;
}

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in space-y-8">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-800 tracking-tight">Properties</h1>
          <p className="text-slate-500 mt-1">管理物件の一覧・編集</p>
        </div>
        <Link
          href="/properties/new"
          className="group flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-medium transition-all shadow-lg shadow-sky-200 hover:shadow-sky-300 active:scale-95 w-fit"
        >
          <Plus className="w-5 h-5" />
          <span>物件を登録</span>
        </Link>
      </div>

      {/* 検索バー */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="物件名や住所で検索..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* 物件グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">登録されている物件はありません</p>
            <p className="text-slate-400 text-sm mt-1">新しい物件を登録して管理を始めましょう</p>
          </div>
        ) : (
          properties.map((property) => (
            <div key={property.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-sky-600 transition-colors">
                    {property.name}
                  </h3>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors ml-2">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-xl">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                    <span className="line-clamp-2">{property.address}</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Checkout
                    </div>
                    <div className="font-medium text-slate-700">{property.checkoutTime}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Fee
                    </div>
                    <div className="font-medium text-emerald-600">¥{property.cleaningFee.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-medium text-slate-500">
                  累計タスク: {property._count.cleaningTasks}件
                </span>
                <Link
                  href={`/properties/${property.id}`} // 詳細ページは未実装だがリンクだけ用意
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
