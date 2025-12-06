"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import {
  User,
  Phone,
  Building2,
  Save,
  Loader2,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

interface Property { id: string; name: string; }

export default function NewStaffForm({ properties }: { properties: Property[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", propertyIds: [] as string[] });

  const handlePropertyToggle = (propertyId: string) => {
    setFormData((prev) => ({ ...prev, propertyIds: prev.propertyIds.includes(propertyId) ? prev.propertyIds.filter((id) => id !== propertyId) : [...prev.propertyIds, propertyId] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "スタッフの登録に失敗しました"); }
      showToast("スタッフを登録しました", "success");
      router.push("/staff");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "エラーが発生しました", "error");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">
          {/* 氏名 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              氏名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
              placeholder="例: 田中 花子"
              required
            />
          </div>

          {/* 電話番号 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              電話番号
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
              placeholder="例: 090-1234-5678"
            />
          </div>

          {/* 担当物件 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              担当物件
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
              {properties.map((property) => (
                <label
                  key={property.id}
                  className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.propertyIds.includes(property.id)
                      ? "bg-indigo-50 border-indigo-200 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.propertyIds.includes(property.id)
                      ? "bg-indigo-500 border-indigo-500"
                      : "bg-white border-slate-300"
                    }`}>
                    {formData.propertyIds.includes(property.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.propertyIds.includes(property.id)}
                    onChange={() => handlePropertyToggle(property.id)}
                    className="hidden"
                  />
                  <span className={`font-medium ${formData.propertyIds.includes(property.id) ? "text-indigo-900" : "text-slate-700"}`}>
                    {property.name}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2 pl-1">LINE連携は、スタッフがLINE公式アカウントをフォローした後に管理者が設定します</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Link
          href="/staff"
          className="flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-bold transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              スタッフを登録
            </>
          )}
        </button>
      </div>
    </form>
  );
}
