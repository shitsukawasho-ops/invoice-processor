"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  MoreHorizontal,
  Search,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle
} from "lucide-react";

interface Property {
  id: string;
  name: string;
  address: string;
  checkoutTime: string;
  cleaningFee: number;
  _count: {
    cleaningTasks: number;
  };
}

export default function PropertiesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/properties");
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/properties/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProperties(properties.filter(p => p.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        const error = await res.json();
        showToast(error.error || "削除に失敗しました", "error");
      }
    } catch (error) {
      console.error("Failed to delete property:", error);
      showToast("削除に失敗しました", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <>
      {/* 削除確認ダイアログ */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50/50">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">物件を削除</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                <span className="font-bold text-slate-700">{deleteTarget.name}</span><br />
                を削除しますか？<br />
                <span className="text-red-500 font-medium">関連するタスクも全て削除されます。</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === property.id ? null : property.id)}
                        className="text-slate-400 hover:text-slate-600 transition-colors ml-2"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {openMenu === property.id && (
                        <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-10 min-w-[120px]">
                          <button
                            onClick={() => {
                              setDeleteTarget(property);
                              setOpenMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            削除
                          </button>
                        </div>
                      )}
                    </div>
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
                    href={`/properties/${property.id}`}
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
    </>
  );
}
