"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import {
  User,
  Phone,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Trash2,
  Loader2,
  AlertTriangle,
  MoreHorizontal
} from "lucide-react";

interface Staff {
  id: string;
  name: string;
  phone: string | null;
  lineUserId: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    cleaningTasks: number;
  };
}

export default function StaffPage() {
  const { showToast } = useToast();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [lineFilter, setLineFilter] = useState<"all" | "connected" | "disconnected">("all");
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/staff/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStaffList(staffList.filter(s => s.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        const error = await res.json();
        showToast(error.error || "削除に失敗しました", "error");
      }
    } catch (error) {
      console.error("Failed to delete staff:", error);
      showToast("削除に失敗しました", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      // 検索フィルター
      const matchesSearch = searchQuery === "" ||
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (staff.phone && staff.phone.includes(searchQuery));

      // ステータスフィルター
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && staff.isActive) ||
        (statusFilter === "inactive" && !staff.isActive);

      // LINE連携フィルター
      const matchesLine = lineFilter === "all" ||
        (lineFilter === "connected" && staff.lineUserId) ||
        (lineFilter === "disconnected" && !staff.lineUserId);

      return matchesSearch && matchesStatus && matchesLine;
    });
  }, [staffList, searchQuery, statusFilter, lineFilter]);

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
              <h3 className="text-xl font-bold text-slate-800 mb-2">スタッフを削除</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                <span className="font-bold text-slate-700">{deleteTarget.name}</span> さんを削除しますか？<br />
                <span className="text-red-500 font-medium">この操作は取り消せません。</span>
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

        {/* 検索・フィルター */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="スタッフ名や電話番号で検索..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 bg-slate-50 border-none rounded-xl text-slate-700 focus:ring-2 focus:ring-sky-500/20 outline-none"
          >
            <option value="all">すべてのステータス</option>
            <option value="active">稼働中のみ</option>
            <option value="inactive">停止中のみ</option>
          </select>
          <select
            value={lineFilter}
            onChange={(e) => setLineFilter(e.target.value as any)}
            className="px-4 py-2.5 bg-slate-50 border-none rounded-xl text-slate-700 focus:ring-2 focus:ring-sky-500/20 outline-none"
          >
            <option value="all">すべてのLINE状態</option>
            <option value="connected">LINE連携済み</option>
            <option value="disconnected">LINE未連携</option>
          </select>
        </div>

        {/* スタッフテーブル */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {filteredStaff.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">
                {searchQuery || statusFilter !== "all" || lineFilter !== "all"
                  ? "該当するスタッフが見つかりません"
                  : "登録されているスタッフはいません"}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {searchQuery || statusFilter !== "all" || lineFilter !== "all"
                  ? "検索条件を変更してください"
                  : "新しいスタッフを登録して業務を割り当てましょう"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">スタッフ</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">電話番号</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">ステータス</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">LINE連携</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">担当タスク</th>
                  <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                          {staff.name.slice(0, 1)}
                        </div>
                        <span className="font-bold text-slate-800">{staff.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>{staff.phone || "未登録"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${staff.isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                        }`}>
                        {staff.isActive ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            稼働中
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            停止中
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {staff.lineUserId ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#06C755]/10 text-[#06C755]">
                          <MessageCircle className="w-3.5 h-3.5" />
                          連携済み
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-400">
                          <MessageCircle className="w-3.5 h-3.5" />
                          未連携
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-600 font-medium">{staff._count.cleaningTasks}件</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/staff/${staff.id}`}
                          className="px-3 py-1.5 text-sm font-bold text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          詳細
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === staff.id ? null : staff.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          {openMenu === staff.id && (
                            <div className="absolute right-0 bottom-full mb-1 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-10 min-w-[120px]">
                              <button
                                onClick={() => {
                                  setDeleteTarget(staff);
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 件数表示 */}
        <div className="text-sm text-slate-500">
          {filteredStaff.length} 件のスタッフ
          {(searchQuery || statusFilter !== "all" || lineFilter !== "all") && ` (全 ${staffList.length} 件中)`}
        </div>
      </div>
    </>
  );
}
