import { Building2 } from "lucide-react";

const cases = [
    {
        company: "株式会社StayGold様",
        industry: "民泊運営代行",
        scale: "管理物件数：150件",
        comment: "シフト作成にかかる時間が月40時間から5時間に短縮されました。スタッフとの連絡ミスもなくなり、運営品質が向上しました。",
    },
    {
        company: "合同会社エアホスト様",
        industry: "不動産管理",
        scale: "管理物件数：50件",
        comment: "LINE連携が決め手でした。高齢の清掃スタッフでも問題なく使えており、導入初日からスムーズに運用できています。",
    },
    {
        company: "個人オーナー T.S様",
        industry: "民泊オーナー",
        scale: "管理物件数：8件",
        comment: "副業で運営しているため、本業中に連絡が来ないのが助かります。清掃完了通知が写真付きで届くので安心です。",
    },
];

export function CaseStudies() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        導入事例
                    </h2>
                    <p className="text-gray-600">
                        多くの企業様・オーナー様に選ばれています
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {cases.map((item, index) => (
                        <div key={index} className="bg-slate-50 p-8 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-200">
                                    <Building2 className="w-6 h-6 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{item.company}</h3>
                                    <p className="text-xs text-gray-500">{item.industry} / {item.scale}</p>
                                </div>
                            </div>
                            <div className="relative">
                                <span className="absolute -top-4 -left-2 text-4xl text-blue-200 font-serif">“</span>
                                <p className="text-gray-700 text-sm leading-relaxed relative z-10">
                                    {item.comment}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
