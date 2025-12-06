"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Building2, User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        companyName: "",
        slug: "",
        adminName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // 会社名からslugを自動生成
        if (name === "companyName") {
            const autoSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .slice(0, 30);
            setFormData((prev) => ({ ...prev, slug: autoSlug }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("パスワードが一致しません");
            return;
        }

        if (formData.password.length < 8) {
            setError("パスワードは8文字以上で入力してください");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizationName: formData.companyName,
                    slug: formData.slug,
                    adminName: formData.adminName,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "登録に失敗しました");
                return;
            }

            // 登録成功 - ログインページへリダイレクト
            router.push(`/login?registered=true&slug=${data.slug}`);
        } catch (err) {
            console.error("Registration error:", err);
            setError("登録中にエラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* ロゴ */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 text-sky-500 mb-4">
                        <Sparkles className="w-8 h-8 fill-sky-500" />
                        <h1 className="text-2xl font-bold font-display tracking-tight text-slate-800">
                            Minpaku<span className="text-sky-500">Clean</span>
                        </h1>
                    </div>
                    <p className="text-slate-500">新規会社登録</p>
                </div>

                {/* 登録フォーム */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* 会社情報 */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                会社情報
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    会社名
                                </label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                    placeholder="株式会社サンプル"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    会社ID（サブドメイン）
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        required
                                        placeholder="sample-corp"
                                        pattern="[a-z0-9-]+"
                                        className="flex-1 px-4 py-3 border border-slate-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                    />
                                    <span className="px-4 py-3 bg-slate-100 text-slate-500 text-sm border border-l-0 border-slate-200 rounded-r-xl">
                                        .minpaku.app
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">英小文字・数字・ハイフンのみ</p>
                            </div>
                        </div>

                        {/* 管理者情報 */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <User className="w-4 h-4" />
                                管理者情報
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    管理者名
                                </label>
                                <input
                                    type="text"
                                    name="adminName"
                                    value={formData.adminName}
                                    onChange={handleChange}
                                    required
                                    placeholder="山田 太郎"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    メールアドレス
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="admin@example.com"
                                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    パスワード
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={8}
                                        placeholder="8文字以上"
                                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    パスワード（確認）
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="もう一度入力"
                                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold rounded-xl hover:from-sky-600 hover:to-indigo-600 transition-all shadow-lg shadow-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    登録中...
                                </>
                            ) : (
                                <>
                                    登録する
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500">
                            既にアカウントをお持ちの方は
                            <Link href="/login" className="text-sky-500 hover:text-sky-600 font-medium ml-1">
                                ログイン
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
