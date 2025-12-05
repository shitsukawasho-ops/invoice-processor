"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", address: "", checkoutTime: "11:00", cleaningDurationMinutes: "120", cleaningFee: "5000" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/properties", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, cleaningDurationMinutes: parseInt(formData.cleaningDurationMinutes), cleaningFee: parseInt(formData.cleaningFee) }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "物件の作成に失敗しました"); }
      router.push("/properties");
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "エラーが発生しました"); } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🏠 新規物件登録</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">物件名 <span className="text-red-500">*</span></label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="例: サンシャインマンション 301号室" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">住所 <span className="text-red-500">*</span></label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="例: 東京都新宿区西新宿1-1-1" required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">チェックアウト時刻</label>
              <input type="time" value={formData.checkoutTime} onChange={(e) => setFormData({ ...formData, checkoutTime: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">清掃時間（分）</label>
              <input type="number" value={formData.cleaningDurationMinutes} onChange={(e) => setFormData({ ...formData, cleaningDurationMinutes: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">報酬（円）</label>
              <input type="number" value={formData.cleaningFee} onChange={(e) => setFormData({ ...formData, cleaningFee: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link href="/properties" className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors">キャンセル</Link>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm">{loading ? "登録中..." : "物件を登録"}</button>
        </div>
      </form>
    </div>
  );
}
