import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";

export function CTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Vibrant Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-cyan-500" />

            {/* Playful Patterns */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20" />
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl animate-float" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-amber-300/30 rounded-full blur-2xl animate-float" style={{ animationDelay: "1s" }} />

            <div className="container mx-auto px-4 text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-8 text-white tracking-wide leading-tight drop-shadow-sm">
                    民泊運営の効率化を、<br />
                    ここから始めましょう！
                </h2>
                <p className="text-sky-50 mb-12 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-bold">
                    14日間の無料トライアルで、その効果を実感してください。<br />
                    導入に関するご相談も承っております。
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link href="/register" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto h-16 px-12 text-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-600/20 transition-all hover:scale-105 font-bold rounded-full border-4 border-amber-200/30">
                            無料で試してみる
                            <ArrowRight className="ml-2 w-6 h-6" />
                        </Button>
                    </Link>
                    <Link href="/contact" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 px-12 text-lg border-2 border-white bg-white/10 text-white hover:bg-white hover:text-sky-600 rounded-full backdrop-blur-sm transition-all font-bold">
                            <Mail className="mr-2 w-6 h-6" />
                            お問い合わせ
                        </Button>
                    </Link>
                </div>

                <p className="mt-8 text-sm text-sky-100 font-medium">
                    ※クレジットカード登録は不要です
                </p>
            </div>
        </section>
    );
}
