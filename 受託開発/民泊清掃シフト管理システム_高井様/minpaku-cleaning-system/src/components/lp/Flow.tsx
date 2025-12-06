import { ArrowRight } from "lucide-react";

const steps = [
    {
        number: "01",
        title: "お問い合わせ",
        description: "まずはフォームよりお気軽にお問い合わせください。担当者よりご連絡いたします。",
    },
    {
        number: "02",
        title: "ヒアリング・デモ",
        description: "現状の課題をお伺いし、実際の画面をお見せしながら最適な運用をご提案します。",
    },
    {
        number: "03",
        title: "無料トライアル",
        description: "14日間、全ての機能を無料でお試しいただけます。初期設定もサポートいたします。",
    },
    {
        number: "04",
        title: "本契約・運用開始",
        description: "トライアルで効果を実感いただけましたら、本契約となります。最短3日で導入可能です。",
    },
];

export function Flow() {
    return (
        <section className="py-20 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        導入までの流れ
                    </h2>
                    <div className="w-16 h-1 bg-blue-900 mx-auto rounded-full" />
                </div>

                <div className="grid md:grid-cols-4 gap-8 relative">
                    {/* Connecting Line (Desktop only) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-200 -z-10" />

                    {steps.map((step, index) => (
                        <div key={index} className="relative bg-white md:bg-transparent p-6 md:p-0 rounded-lg shadow-sm md:shadow-none border md:border-none border-gray-100">
                            <div className="w-24 h-24 bg-white rounded-full border-4 border-blue-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <span className="text-3xl font-bold text-blue-900">{step.number}</span>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* Arrow for Mobile */}
                            {index < steps.length - 1 && (
                                <div className="md:hidden flex justify-center mt-6 text-gray-300">
                                    <ArrowRight className="w-6 h-6 rotate-90" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
