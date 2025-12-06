"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  Building2,
  FileText,
  Save,
  Loader2,
  ArrowLeft
} from "lucide-react";

interface Property { id: string; name: string; checkoutTime: string; cleaningFee: number; }
interface Staff { id: string; name: string; propertyAssignments: { propertyId: string }[]; }

export default function NewTaskForm({ properties, staff }: { properties: Property[]; staff: Staff[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ propertyId: "", cleaningDate: "", checkoutTime: "", cleaningFee: "", staffId: "", notes: "" });

  const selectedProperty = properties.find((p) => p.id === formData.propertyId);
  const availableStaff = staff.filter((s) => s.propertyAssignments.some((a) => a.propertyId === formData.propertyId));

  const handlePropertyChange = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    setFormData({ ...formData, propertyId, checkoutTime: property?.checkoutTime || "", cleaningFee: property?.cleaningFee?.toString() || "", staffId: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, cleaningFee: parseInt(formData.cleaningFee) || undefined, staffId: formData.staffId || undefined }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "タスクの作成に失敗しました"); }
      showToast("タスクを作成しました", "success");
      router.push("/tasks");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "エラーが発生しました", "error");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">
          {/* 物件選択 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              物件 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.propertyId}
              onChange={(e) => handlePropertyChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800"
              required
            >
              <option value="">選択してください</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* 清掃日 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              清掃日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.cleaningDate}
              onChange={(e) => setFormData({ ...formData, cleaningDate: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800"
                placeholder={selectedProperty?.checkoutTime}
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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800"
                placeholder={selectedProperty?.cleaningFee?.toString()}
              />
            </div>
          </div>

          {/* 担当スタッフ */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              担当スタッフ（任意）
            </label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData.propertyId}
            >
              <option value="">後で割り当てる</option>
              {formData.propertyId && <>
                <optgroup label="担当可能スタッフ">{availableStaff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>
                <optgroup label="その他のスタッフ">{staff.filter((s) => !availableStaff.find((as) => as.id === s.id)).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>
              </>}
            </select>
            <p className="text-xs text-slate-500 pl-1">スタッフを選択すると自動的に「確定」ステータスになります</p>
          </div>

          {/* 備考 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              備考
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800 resize-none"
              placeholder="特記事項があれば入力してください"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Link
          href="/tasks"
          className="flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-bold transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-lg shadow-sky-200 hover:shadow-sky-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              タスクを作成
            </>
          )}
        </button>
      </div>
    </form>
  );
}
