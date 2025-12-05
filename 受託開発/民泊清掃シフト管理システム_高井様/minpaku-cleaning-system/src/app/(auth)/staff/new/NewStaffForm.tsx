"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Property { id: string; name: string; }

export default function NewStaffForm({ properties }: { properties: Property[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "", propertyIds: [] as string[] });

  const handlePropertyToggle = (propertyId: string) => {
    setFormData((prev) => ({ ...prev, propertyIds: prev.propertyIds.includes(propertyId) ? prev.propertyIds.filter((id) => id !== propertyId) : [...prev.propertyIds, propertyId] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "スタッフの登録に失敗しました"); }
      router.push("/staff");
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "エラーが発生しました"); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">氏名 <span className="text-red-500">*</span></label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="例: 田中 花子" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
          <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="例: 090-1234-5678" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">担当物件</label>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {properties.map((property) => (
              <label key={property.id} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.propertyIds.includes(property.id) ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200 hover:border-gray-300"}`}>
                <input type="checkbox" checked={formData.propertyIds.includes(property.id)} onChange={() => handlePropertyToggle(property.id)} className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500" />
                <span className="text-gray-800">{property.name}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">LINE連携は、スタッフがLINE公式アカウントをフォローした後に管理者が設定します</p>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Link href="/staff" className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors">キャンセル</Link>
        <button type="submit" disabled={loading} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm">{loading ? "登録中..." : "スタッフを登録"}</button>
      </div>
    </form>
  );
}
