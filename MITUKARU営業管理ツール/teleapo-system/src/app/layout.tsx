import type { Metadata } from "next";
import { Rajdhani, JetBrains_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

const rajdhani = Rajdhani({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rajdhani',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "テレアポ管理システム - 営業効率化ツール",
  description: "テレアポ業務と予実管理を効率化するWebアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${rajdhani.variable} ${jetbrainsMono.variable} ${notoSansJP.variable}`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
