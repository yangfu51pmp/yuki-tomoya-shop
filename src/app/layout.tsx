import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#141416",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://yuki-tomoya-shop.vercel.app"),
  title: "ユキ&トモヤ 日本選物代購｜日本職人好物・安心直送台灣",
  description: "嚴選日本棒壘運動裝備、KUMON公文教材文具、家庭保健益生菌與日本質感生活百貨。日本仙台現地連線直送。",
  openGraph: {
    title: "ユキ&トモヤ 日本選物代購｜日本職人好物・安心直送台灣",
    description: "嚴選日本棒壘運動裝備、KUMON公文教材文具、家庭保健益生菌與日本質感生活百貨。日本仙台現地連線直送。",
    url: "https://yuki-tomoya-shop.vercel.app",
    siteName: "ユキ&トモヤ 日本選物代購",
    locale: "zh_TW",
    type: "website",
    images: [
      {
        url: "https://yuki-tomoya-shop.vercel.app/og-share.jpg",
        width: 1200,
        height: 628,
        alt: "ユキ&トモヤ 日本選物代購",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ユキ&トモヤ 日本選物代購｜日本職人好物・安心直送台灣",
    description: "嚴選日本棒壘運動裝備、KUMON公文教材文具、家庭保健益生菌與日本質感生活百貨。",
    images: ["https://yuki-tomoya-shop.vercel.app/og-share.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
