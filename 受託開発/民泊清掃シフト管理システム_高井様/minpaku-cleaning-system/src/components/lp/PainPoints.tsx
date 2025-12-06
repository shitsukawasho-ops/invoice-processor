import { HelpCircle } from "lucide-react";

const pains = [
    {
        text: "清掃スタッフとの連絡がLINEや電話でバラバラ...",
    },
    {
        text: "急な予約変更でシフト調整に追われている...",
    },
    {
        text: "清掃完了の報告漏れや、品質のばらつきが心配...",
    },
    {
        text: "複数の物件管理で、スケジュール把握が限界...",
    },
];

export function PainPoints() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        このような課題で<br className="md:hidden" />お困りではありませんか？
                    </h2>
                    <div className="w-16 h-1 bg-blue-900 mx-auto rounded-full" />
                </div>

                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
                    {pains.map((pain, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-4 p-6 bg-slate-50 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                    <HelpCircle className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                            <p className="text-gray-700 font-medium leading-relaxed pt-2">
                                {pain.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
