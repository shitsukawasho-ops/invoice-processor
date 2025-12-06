import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Pricing() {
    return (
        <section id="pricing" className="py-20 lg:py-32 bg-blue-50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                        シンプルで透明な料金プラン
                    </h2>
                    <p className="text-lg text-gray-600">
                        初期費用0円。使った分だけのお支払い。<br />
                        あなたのビジネスの成長に合わせて柔軟に対応します。
                    </p>
                </div>

                <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-blue-100">
                    <div className="p-8 lg:p-12 text-center bg-gradient-to-b from-white to-blue-50/50">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">スタンダードプラン</h3>
                        <p className="text-gray-500 mb-8">個人オーナーから管理会社まで</p>

                        <div className="flex items-baseline justify-center gap-2 mb-4">
                            <span className="text-5xl font-bold text-blue-600">¥5,000</span>
                            <span className="text-gray-500">/月</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-8">
                            ※5物件まで定額。以降1物件につき +¥1,000
                        </p>

                        <Link href="/register">
                            <Button className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
                                14日間無料で試す
                            </Button>
                        </Link>
                        <p className="text-xs text-gray-400 mt-4">クレジットカード登録不要</p>
                    </div>

                    <div className="p-8 lg:p-12 border-t border-gray-100">
                        <ul className="space-y-4">
                            {[
                                "物件登録数 無制限",
                                "スタッフアカウント数 無制限",
                                "LINE連携機能",
                                "予約サイト自動同期",
                                "清掃報告・承認フロー",
                                "チャットサポート",
                            ].map((item, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
