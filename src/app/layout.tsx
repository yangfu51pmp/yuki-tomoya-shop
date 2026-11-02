import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "redis";
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

export async function generateMetadata(): Promise<Metadata> {
  let ogTitle = "";
  let ogDesc = "";
  let ogVersion = "1";
  let siteTitle = "";
  let siteAnnouncement = "";

  const redisUrl =
    process.env.REDIS_URL ||
    process.env.STORAGE_URL ||
    process.env.KV_URL ||
    "";

  if (redisUrl) {
    try {
      const client = createClient({ url: redisUrl });
      await client.connect();
      const [rOgTitle, rOgDesc, rOgVer, rSiteTitle, rSiteAnnounce] = await Promise.all([
        client.get("yt_og_title"),
        client.get("yt_og_description"),
        client.get("yt_og_image_version"),
        client.get("yt_site_title"),
        client.get("yt_site_announcement"),
      ]);
      await client.quit();

      if (rOgTitle) ogTitle = rOgTitle;
      if (rOgDesc) ogDesc = rOgDesc;
      if (rOgVer) ogVersion = rOgVer;
      if (rSiteTitle) siteTitle = rSiteTitle;
      if (rSiteAnnounce) siteAnnouncement = rSiteAnnounce;
    } catch (e) {
      console.error("Failed to read metadata from Redis:", e);
    }
  }

  const title =
    ogTitle ||
    (siteTitle ? `${siteTitle}｜ユキ&トモヤ 日本選物代購` : "ユキ&トモヤ 日本選物代購｜日本職人好物・安心直送台灣");

  const description =
    ogDesc ||
    siteAnnouncement ||
    "嚴選日本棒壘運動裝備、KUMON公文教材文具、家庭保健益生菌與日本質感生活百貨。日本仙台現地連線直送。";

  const ogImageUrl = `https://yuki-tomoya-shop.vercel.app/og-share.jpg?v=${ogVersion || "1"}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://yuki-tomoya-shop.vercel.app",
      siteName: "ユキ&トモヤ 日本選物代購",
      locale: "zh_TW",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 628,
          alt: title,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

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
