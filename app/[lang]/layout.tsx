import type { Metadata } from "next";
import { lang } from "next/root-params";
import { Geist, Geist_Mono } from "next/font/google";
import { locales } from "@/lib/i18n";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return locales.map((l) => ({ lang: l }));
}

export const metadata: Metadata = {
  title: "Minh Global — Quản lý chất lượng bê tông",
  description: "Kiểm soát nhập liệu bê tông, theo dõi bảo dưỡng nén mẫu",
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  return (
    <html
      lang={await lang()}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
