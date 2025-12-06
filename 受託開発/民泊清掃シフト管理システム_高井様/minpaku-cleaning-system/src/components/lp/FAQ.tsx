import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "無料トライアル期間中に料金は発生しますか？",
        answer: "いいえ、発生しません。14日間の無料トライアル期間中は完全無料で全ての機能をご利用いただけます。期間終了後に自動で課金されることもありません。",
    },
    {
        question: "物件数が5件を超えた場合の料金はどうなりますか？",
        answer: "5件までは月額5,000円の基本料金に含まれます。6件目以降は、1物件追加ごとに月額1,000円が加算されます。例えば、7件の場合は5,000円 + (1,000円 × 2件) = 7,000円となります。",
    },
    {
        question: "スタッフへのLINE通知に料金はかかりますか？",
        answer: "いいえ、システムからのLINE通知は無料です。スタッフの方もLINEアプリさえあれば、追加料金なしでご利用いただけます。",
    },
    {
        question: "導入サポートはありますか？",
        answer: "はい、ございます。初期設定やスタッフへの案内方法など、チャットサポートにて丁寧にご案内させていただきます。",
    },
];

export function FAQ() {
    return (
        <section id="faq" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        よくある質問
                    </h2>
                    <div className="w-16 h-1 bg-blue-900 mx-auto rounded-full" />
                </div>

                <div className="max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6 bg-slate-50">
                                <AccordionTrigger className="text-left text-lg font-bold text-gray-900 hover:no-underline hover:text-blue-900 py-6">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed pb-6 text-base">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
