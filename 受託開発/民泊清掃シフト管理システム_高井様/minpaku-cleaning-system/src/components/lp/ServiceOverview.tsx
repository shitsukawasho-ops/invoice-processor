import {
    LayoutDashboard,
    Users,
    MessageSquare,
    FileText,
    Bell,
    Settings
} from "lucide-react";

const services = [
    {
        icon: <LayoutDashboard className="w-8 h-8 text-sky-600" />,
        title: "一元管理ダッシュボード",
        description: "全物件の稼働状況と清掃ステータスをリアルタイムに把握。",
        color: "bg-sky-100",
    },
    {
        icon: <Users className="w-8 h-8 text-amber-600" />,
        title: "スタッフ管理",
        description: "スタッフ情報の登録・編集、担当物件の割り当てを簡単に。",
        color: "bg-amber-100",
    },
    {
        icon: <MessageSquare className="w-8 h-8 text-emerald-600" />,
        title: "チャット機能",
        description: "物件ごとのグループチャットで、情報の行き違いを防止。",
        color: "bg-emerald-100",
    },
    {
        icon: <FileText className="w-8 h-8 text-rose-600" />,
        title: "自動日報作成",
        description: "清掃完了報告をもとに、オーナー向けの日報を自動生成。",
        color: "bg-rose-100",
    },
    {
        icon: <Bell className="w-8 h-8 text-violet-600" />,
        title: "スマート通知",
        description: "清掃開始・終了、トラブル報告などを即座に管理者へ通知。",
        color: "bg-violet-100",
    },
    {
        icon: <Settings className="w-8 h-8 text-slate-600" />,
        title: "権限設定",
        description: "管理者、スタッフ、オーナーなど、役割に応じた権限管理。",
        color: "bg-slate-100",
    },
];

export function ServiceOverview() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Decorative Dots */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-[radial-gradient(#e2e8f0_3px,transparent_3px)] [background-size:20px_20px] opacity-50" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-[radial-gradient(#e2e8f0_3px,transparent_3px)] [background-size:20px_20px] opacity-50" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="section-title mb-6">
                        機能一覧
                    </h2>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">
                        民泊運営の現場から生まれた、<br className="md:hidden" />
                        本当に必要な機能だけを厳選しました！
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="group p-8 rounded-[2rem] border-2 border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 hover:border-sky-200"
                        >
                            <div className="flex flex-col items-center text-center gap-5">
                                <div className={`w-20 h-20 ${service.color} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                                    {service.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-3">
                                        {service.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        {service.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
