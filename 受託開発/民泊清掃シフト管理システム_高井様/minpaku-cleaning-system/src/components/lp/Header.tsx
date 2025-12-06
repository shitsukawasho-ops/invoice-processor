import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
    return (
        <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">Minpaku Clean</span>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors">
                        機能
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors">
                        料金
                    </Link>
                    <Link href="#faq" className="text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors">
                        よくある質問
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="text-gray-600 hover:text-blue-900 hover:bg-gray-100 font-medium">
                            ログイン
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all hover:shadow-lg font-bold px-6">
                            資料請求・お問い合わせ
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
