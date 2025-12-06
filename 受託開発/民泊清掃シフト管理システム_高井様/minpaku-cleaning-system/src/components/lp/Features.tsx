import { Calendar, MessageSquare, ShieldCheck, Zap } from "lucide-react";

const features = [
    {
        icon: <Calendar className="w-8 h-8 text-blue-600" />,
        title: "スマートなシフト管理",
        description: "カレンダー形式で直感的にシフトを管理。清掃スタッフの空き状況も一目で把握できます。",
    },
    {
        icon: <MessageSquare className="w-8 h-8 text-blue-600" />,
        title: "LINE連携でスムーズ連絡",
        description: "清掃完了報告や緊急時の連絡もLINEで完結。使い慣れたツールで、コミュニケーションコストを削減。",
    },
    {
        icon: <Zap className="w-8 h-8 text-blue-600" />,
        title: "予約自動同期",
        description: "Airbnbなどの予約サイトと連携し、清掃スケジュールを自動作成。入力ミスの心配はありません。",
    },
    {
        icon: <ShieldCheck className="w-8 h-8 text-blue-600" />,
        title: "安心の品質管理",
        description: "清掃前後の写真報告機能で、遠隔でも品質をしっかりチェック。トラブルを未然に防ぎます。",
    },
];

export function Features() {
    return (
        <section id="features" className="py-20 lg:py-32 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                        民泊運営に必要な機能を、<br />
                        すべてこのひとつに。
                    </h2>
                    <p className="text-lg text-gray-600">
                        清掃管理の煩わしさから解放され、<br className="hidden lg:block" />
                        ゲストへのおもてなしに集中できる環境を作ります。
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all border border-gray-100 group">
                            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
