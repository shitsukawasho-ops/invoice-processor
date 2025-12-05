"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Property { id: string; name: string; checkoutTime: string; cleaningFee: number; }
interface Staff { id: string; name: string; propertyAssignments: { propertyId: string }[]; }

export default function NewTaskForm({ properties, staff }: { properties: Property[]; staff: Staff[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ propertyId: "", cleaningDate: "", checkoutTime: "", cleaningFee: "", staffId: "", notes: "" });

  const selectedProperty = properties.find((p) => p.id === formData.propertyId);
  const availableStaff = staff.filter((s) => s.propertyAssignments.some((a) => a.propertyId === formData.propertyId));

  const handlePropertyChange = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    setFormData({ ...formData, propertyId, checkoutTime: property?.checkoutTime || "", cleaningFee: property?.cleaningFee?.toString() || "", staffId: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, cleaningFee: parseInt(formData.cleaningFee) || undefined, staffId: formData.staffId || undefined }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "タスクの作成に失敗しました"); }
      router.push("/tasks");
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "エラーが発生しました"); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">物件 <span className="text-red-500">*</span></label>
          <select value={formData.propertyId} onChange={(e) => handlePropertyChange(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" required>
            <option value="">選択してください</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">清掃日 <span className="text-red-500">*</span></label>
          <input type="date" value={formData.cleaningDate} onChange={(e) => setFormData({ ...formData, cleaningDate: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">チェックアウト時刻</label>
            <input type="time" value={formData.checkoutTime} onChange={(e) => setFormData({ ...formData, checkoutTime: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder={selectedProperty?.checkoutTime} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">報酬（円）</label>
            <input type="number" value={formData.cleaningFee} onChange={(e) => setFormData({ ...formData, cleaningFee: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder={selectedProperty?.cleaningFee?.toString()} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">担当スタッフ（任意）</label>
          <select value={formData.staffId} onChange={(e) => setFormData({ ...formData, staffId: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" disabled={!formData.propertyId}>
            <option value="">後で割り当てる</option>
            {formData.propertyId && <>
              <optgroup label="担当可能スタッフ">{availableStaff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>
              <optgroup label="その他のスタッフ">{staff.filter((s) => !availableStaff.find((as) => as.id === s.id)).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>
            </>}
          </select>
          <p className="text-xs text-gray-500 mt-1">スタッフを選択すると自動的に「確定」ステータスになります</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">備考</label>
          <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" placeholder="特記事項があれば入力してください" />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Link href="/tasks" className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors">キャンセル</Link>
        <button type="submit" disabled={loading} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm">{loading ? "作成中..." : "タスクを作成"}</button>
      </div>
    </form>
  );
}
