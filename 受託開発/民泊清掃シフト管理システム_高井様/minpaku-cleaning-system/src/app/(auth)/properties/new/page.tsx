"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Save,
  Loader2,
  ArrowLeft,
  Timer
} from "lucide-react";

export default function NewPropertyPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", address: "", checkoutTime: "11:00", cleaningDurationMinutes: "120", cleaningFee: "5000" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/properties", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, cleaningDurationMinutes: parseInt(formData.cleaningDurationMinutes), cleaningFee: parseInt(formData.cleaningFee) }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "物件の作成に失敗しました"); }
      showToast("物件を登録しました", "success");
      router.push("/properties");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "エラーが発生しました", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display text-slate-800 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-emerald-600" />
          </div>
          新規物件登録
        </h1>
        <p className="text-slate-500 mt-1 ml-14">新しい管理物件を登録します</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 space-y-8">
            {/* 物件名 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                物件名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800"
                placeholder="例: サンシャインマンション 301号室"
                required
              />
            </div>

            {/* 住所 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                住所 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800"
                placeholder="例: 東京都新宿区西新宿1-1-1"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* チェックアウト時刻 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  チェックアウト時刻
                </label>
                <input
                  type="time"
                  value={formData.checkoutTime}
                  onChange={(e) => setFormData({ ...formData, checkoutTime: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800"
                />
              </div>
              {/* 清掃時間 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Timer className="w-4 h-4 text-slate-400" />
                  清掃時間（分）
                </label>
                <input
                  type="number"
                  value={formData.cleaningDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, cleaningDurationMinutes: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800"
                />
              </div>
              {/* 報酬 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  報酬（円）
                </label>
                <input
                  type="number"
                  value={formData.cleaningFee}
                  onChange={(e) => setFormData({ ...formData, cleaningFee: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <Link
            href="/properties"
            className="flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-bold transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                物件を登録
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
