import { CalendarCheck, ShieldCheck, Smartphone } from "lucide-react";

const reasons = [
    {
        icon: <CalendarCheck className="w-10 h-10 text-sky-600" />,
        title: "予約サイトと完全自動連携",
        description: "Airbnbなどの主要予約サイトとカレンダーを同期。予約が入ると同時に清掃シフトを自動作成し、スタッフへ通知します。手動での連絡ミスをゼロにします。",
        image: "bg-sky-50",
        blobColor: "bg-sky-200",
    },
    {
        icon: <Smartphone className="w-10 h-10 text-amber-600" />,
        title: "LINEで完結する業務連絡",
        description: "スタッフは使い慣れたLINEでシフト確認や完了報告が可能。専用アプリのインストールは不要で、高齢のスタッフでもスムーズに導入できます。",
        image: "bg-amber-50",
        blobColor: "bg-amber-200",
    },
    {
        icon: <ShieldCheck className="w-10 h-10 text-emerald-600" />,
        title: "写真付き報告で品質担保",
        description: "清掃前後の写真を必ずアップロードする仕組みで、遠隔地からでも品質を確実にチェック。万が一のトラブル時も証跡として残るため安心です。",
        image: "bg-emerald-50",
        blobColor: "bg-emerald-200",
    },
];

export function WhyUs() {
    return (
        <section className="py-24 bg-sky-50/50 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-24">
                    <span className="inline-block px-4 py-1 rounded-full bg-sky-100 text-sky-600 font-bold text-sm mb-4">Why Us</span>
                    <h2 className="section-title mb-6">
                        Minpaku Cleanが<br className="md:hidden" />選ばれる3つの理由
                    </h2>
                </div>

                <div className="space-y-32">
                    {reasons.map((reason, index) => (
                        <div
                            key={index}
                            className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${index % 2 === 1 ? "md:flex-row-reverse" : ""
                                }`}
                        >
                            <div className="w-full md:w-1/2 relative">
                                {/* Blob Background */}
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] ${reason.blobColor} rounded-full blur-3xl opacity-50 -z-10`} />

                                <div className="relative group transform hover:scale-105 transition-transform duration-500">
                                    <div className="aspect-[4/3] rounded-[2.5rem] shadow-xl border-4 border-white bg-white p-2 relative z-10 overflow-hidden">
                                        {/* Image Placeholder */}
                                        <div className={`w-full h-full rounded-[2rem] ${reason.image} flex items-center justify-center text-slate-400`}>
                                            <span className="text-lg font-bold">イメージ画像</span>
                                        </div>
                                    </div>
                                    {/* Decorative Elements */}
                                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl animate-bounce-slight">
                                        {index === 0 ? "📅" : index === 1 ? "💬" : "📸"}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-1/2">
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md border border-slate-100">
                                        {reason.icon}
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800">
                                        {reason.title}
                                    </h3>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-lg font-medium">
                                    {reason.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
