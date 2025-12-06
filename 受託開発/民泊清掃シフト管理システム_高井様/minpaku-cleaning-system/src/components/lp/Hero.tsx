import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
            {/* Playful Background Blobs */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-cyan-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/50 rounded-full blur-3xl -z-10" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="lg:w-1/2 text-center lg:text-left animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-sky-100 text-sky-600 text-sm font-bold mb-8 shadow-sm animate-bounce-slight">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>民泊運営をもっと楽しく、もっと楽に！</span>
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-wide">
                            民泊清掃管理の<br />
                            <span className="text-sky-500 inline-block transform hover:scale-105 transition-transform cursor-default">悩み</span>を
                            <span className="text-amber-500 inline-block transform hover:scale-105 transition-transform cursor-default">ゼロ</span>に。
                        </h1>

                        <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                            シフト作成も、スタッフ連絡も、品質チェックも。<br />
                            ぜーんぶスマホひとつで完結！<br />
                            あなたの民泊ビジネスを、次のステージへ。
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                            <Link href="/register" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto h-16 px-10 text-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-200 transition-all hover:scale-105 hover:shadow-2xl font-bold rounded-full btn-pop border-4 border-amber-200/50">
                                    無料で試してみる！
                                    <ArrowRight className="ml-2 w-6 h-6" />
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-sm text-slate-600 font-bold">
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                                <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <span>導入500社突破！</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                                <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <span>継続率 98.5%</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                                <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <span>安心のサポート</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2 relative animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                        {/* Blob Mask for Image */}
                        <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-cyan-300 rounded-[3rem] rotate-3 transform shadow-2xl" />
                            <div className="absolute inset-0 bg-white rounded-[3rem] -rotate-3 transform border-4 border-slate-100 overflow-hidden flex items-center justify-center shadow-inner">
                                {/* Dashboard Preview Placeholder */}
                                <div className="text-center p-8">
                                    <div className="w-32 h-32 bg-sky-50 rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce-slight">
                                        <span className="text-6xl">📱</span>
                                    </div>
                                    <p className="font-bold text-slate-800 text-2xl mb-2">カンタン管理画面</p>
                                    <p className="text-slate-500 font-medium">直感操作でサクサク管理♪</p>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center shadow-lg animate-bounce-slight" style={{ animationDelay: "1s" }}>
                                <span className="text-3xl">✨</span>
                            </div>
                            <div className="absolute -bottom-4 -left-8 bg-white px-6 py-3 rounded-2xl shadow-xl border border-slate-100 animate-float" style={{ animationDelay: "0.5s" }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold">清掃完了！</p>
                                        <p className="text-sm font-bold text-slate-800">101号室</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
