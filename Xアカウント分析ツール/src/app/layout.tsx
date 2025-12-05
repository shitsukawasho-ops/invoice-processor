import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "X Account Analysis Tool",
  description: "Quantitative visualization of X account data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} bg-background text-text-primary`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 ml-[240px]">
            <div className="p-8 max-w-[1600px] mx-auto">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
