import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center border border-blue-800">
                                <span className="text-white font-bold text-xl">M</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight">Minpaku Clean</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed max-w-sm text-sm">
                            民泊清掃管理の新しいスタンダード。<br />
                            効率的な運営で、最高のゲスト体験を。<br />
                            <br />
                            〒150-0000<br />
                            東京都渋谷区...
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-gray-200">サービス</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><Link href="#features" className="hover:text-white transition-colors">機能一覧</Link></li>
                            <li><Link href="#pricing" className="hover:text-white transition-colors">料金プラン</Link></li>
                            <li><Link href="#faq" className="hover:text-white transition-colors">よくある質問</Link></li>
                            <li><Link href="/register" className="hover:text-white transition-colors">無料トライアル</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-gray-200">会社情報</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">運営会社</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">利用規約</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">特定商取引法に基づく表記</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">お問い合わせ</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-xs">
                    © {new Date().getFullYear()} Minpaku Clean. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
