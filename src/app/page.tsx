/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import AiVideoPlayer from "@/components/AiVideoPlayer";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // 動態綁定 Redis 的網站主標題、頂部公告與連結
  const [siteTitle, setSiteTitle] = useState("日本職人好物・安心直送台灣");
  const [siteAnnouncement, setSiteAnnouncement] = useState("✈️ ユキ&トモヤ 日本現地連線代購中！運動裝備・文具教材・保健益生菌・日本直送");
  const [siteAnnouncementUrl, setSiteAnnouncementUrl] = useState("");

  // 動態綁定網站主視覺背景
  const [siteHeroImage, setSiteHeroImage] = useState(""); // 新背景圖

  // 動態綁定影片區塊
  const [sitePromoVideo, setSitePromoVideo] = useState("https://assets.mixkit.co/videos/preview/mixkit-pouring-coffee-into-a-cup-41545-large.mp4");
  const [sitePromoVideoTitle, setSitePromoVideoTitle] = useState("FEATURED VIDEO ｜ ユキ&トモヤ 日本現場連線實拍");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiScript, setAiScript] = useState<any>(null);

  // 分類圖片
  const [catImg1, setCatImg1] = useState("https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=80"); // 文具
  const [catImg2, setCatImg2] = useState("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80"); // 益智
  const [catImg3, setCatImg3] = useState("https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80"); // 小物

  // 預設分類商品資料
  const defaultProducts1 = [
    { id: "1-1", name: "KOKUYO Campus 筆記本", price: "NT$180", desc: "日本東大生愛用五冊組，好寫不暈染。", imageUrl: "https://images.unsplash.com/photo-1531346878377-a54483b14dc0?w=400&q=80" },
    { id: "1-2", name: "PILOT 魔擦筆 3 色組", price: "NT$250", desc: "辦公學習必備，滑順好寫好擦。", imageUrl: "https://images.unsplash.com/photo-1585336261022-680e2a5ce249?w=400&q=80" }
  ];

  const defaultProducts2 = [
    { id: "2-1", name: "KUMON 益智拼圖", price: "NT$450", desc: "日本學齡啟蒙推薦，培養專注力。", imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80" },
    { id: "2-2", name: "KUMON 三角鉛筆", price: "NT$150", desc: "適合幼兒抓握的粗三角設計，矯正握姿。", imageUrl: "https://images.unsplash.com/photo-1550592704-6c76defa99ce?w=400&q=80" }
  ];

  const defaultProducts3 = [
    { id: "3-1", name: "日本限定 帆布托特包", price: "NT$680", desc: "簡約百搭，輕巧好提，日常好幫手。", imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80" },
    { id: "3-2", name: "日本製 質感馬克杯", price: "NT$350", desc: "職人手作，溫潤質感，提升生活儀式感。", imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80" }
  ];

  const [catProducts1, setCatProducts1] = useState(defaultProducts1);
  const [catProducts2, setCatProducts2] = useState(defaultProducts2);
  const [catProducts3, setCatProducts3] = useState(defaultProducts3);

  const [isVerticalVideo, setIsVerticalVideo] = useState(false);

  // 截圖與封面圖模式支援
  const [sitePromoPoster, setSitePromoPoster] = useState("");
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);

  // 預覽模式
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // 1. 若網址帶有即時預覽參數，優先同步顯示（確保 LINE 截圖 100% 零延遲拍到最新文字）
    const params = new URLSearchParams(window.location.search);
    const liveTitle = params.get("live_title");
    const liveNotice = params.get("live_notice");
    const liveUrl = params.get("live_url");
    const liveBg = params.get("live_bg");
    const liveVideo = params.get("live_video");
    const liveVideoTitle = params.get("live_video_title");
    const isScreenshot = params.get("screenshot") === "1";
    const livePoster = params.get("live_poster");
    const liveOrientation = params.get("live_orientation");

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (liveTitle) setSiteTitle(liveTitle);

    if (liveNotice) setSiteAnnouncement(liveNotice);

    if (liveUrl) setSiteAnnouncementUrl(liveUrl);

    if (liveBg) setSiteHeroImage(liveBg);

    if (liveVideo) setSitePromoVideo(liveVideo);

    if (liveVideoTitle) setSitePromoVideoTitle(liveVideoTitle);

    if (isScreenshot) setIsScreenshotMode(true);

    if (livePoster) setSitePromoPoster(livePoster);

    if (liveOrientation) {
      setIsVerticalVideo(liveOrientation === "vertical");
    }

    // 2. 向後端 API 讀取 Redis 最新設定
    fetch(`/api/line?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.site_title) setSiteTitle(data.site_title);
        if (data?.site_announcement) setSiteAnnouncement(data.site_announcement);
        if (data?.site_announcement_url) setSiteAnnouncementUrl(data.site_announcement_url);
        if (data?.site_hero_image) setSiteHeroImage(data.site_hero_image);
        if (data?.site_promo_video) setSitePromoVideo(data.site_promo_video);
        if (data?.site_promo_video_title) setSitePromoVideoTitle(data.site_promo_video_title);
        if (data?.site_promo_poster && !livePoster) setSitePromoPoster(data.site_promo_poster);
        if (data?.site_promo_orientation && !liveOrientation) {
          setIsVerticalVideo(data.site_promo_orientation === "vertical");
        }
        if (data?.cat_img_1) setCatImg1(data.cat_img_1);
        if (data?.cat_img_2) setCatImg2(data.cat_img_2);
        if (data?.cat_img_3) setCatImg3(data.cat_img_3);

        if (data?.cat_products_1 && data.cat_products_1.length > 0) setCatProducts1(data.cat_products_1);
        if (data?.cat_products_2 && data.cat_products_2.length > 0) setCatProducts2(data.cat_products_2);
        if (data?.cat_products_3 && data.cat_products_3.length > 0) setCatProducts3(data.cat_products_3);

        const isPreview = new URLSearchParams(window.location.search).get("preview") === "video";
        if (isPreview) {
          setIsPreviewMode(true);
          if (data?.preview_video) setSitePromoVideo(data.preview_video);
          if (data?.preview_ai_script) setAiScript(data.preview_ai_script);
        } else {
          if (data?.video_ai_script) setAiScript(data.video_ai_script);
        }
      })
      .catch((err) => console.error("讀取網站動態設定失敗:", err));
  }, []);

  // 三大日本代購嚴選專區
  const categories = [
    { id: 1, title: "1. 日本文具類嚴選（STATIONERY）", desc: "KOKUYO、Pilot、三菱 Uni 等日本大賞機能文具、書寫筆具與桌面收納用品。", tag: "STATIONERY", img: catImg1, products: catProducts1 },
    { id: 2, title: "2. 日本益智教材類（EDUCATION）", desc: "日本 KUMON 公文式益智教具、學齡啟蒙教材、拼圖卡牌與學習輔助用品。", tag: "EDUCATION", img: catImg2, products: catProducts2 },
    { id: 3, title: "3. 日本精選其它小物（GOODS & ZAKKA）", desc: "日本限定質感生活雜貨、學童日常隨身周邊與日本連線人氣話題小物。", tag: "GOODS & ZAKKA", img: catImg3, products: catProducts3 },
  ];


  return (
    <div className="min-h-screen bg-white text-[#6d6d6d] flex flex-col font-sans relative pb-16 md:pb-0">
      <style>{`
        @keyframes marqueeSlide {
          0% { transform: translateX(45%); }
          50% { transform: translateX(-45%); }
          100% { transform: translateX(45%); }
        }
        .marquee-slide {
          display: inline-block;
          white-space: nowrap;
          animation: marqueeSlide 9s ease-in-out infinite;
        }
      `}</style>

      {/* 1. 頂部公告欄（動態顯示 Redis 公告與連結） */}
      <aside className="bg-[#78C4EC] hover:bg-[#6db3e0] text-white text-xs sm:text-sm py-2 px-4 text-center overflow-hidden shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 overflow-hidden">
          <a
            href={siteAnnouncementUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-medium tracking-wide inline-block ${siteAnnouncementUrl ? 'animate-pulse' : ''}`}
          >
            <span>{siteAnnouncement}</span>
            {siteAnnouncementUrl && (
              <span className="ml-2 text-[#E5F3FC] underline underline-offset-4">
                點擊查看詳情 ↗
              </span>
            )}
          </a>
        </div>
      </aside>

      {/* 2. 頂部導覽列 */}
      <header className="bg-white border-b border-[#6db3e0] sticky top-0 z-40 px-6 sm:px-10 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#78C4EC] flex items-center justify-center font-bold text-white text-lg shadow-sm border-2 border-white">
            Y&T
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-widest text-lg text-[#6d6d6d]">
              ユキ&トモヤ
            </span>
            <span className="text-[9px] text-stone-400 tracking-wider">YUKI & TOMOYA JAPAN SELECT</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-stone-600 tracking-wider">
          <a href="#about" className="hover:text-[#78C4EC] transition">代購流程</a>
          <a href="#categories" className="hover:text-[#78C4EC] transition">嚴選品類</a>
          <a href="#video" className="hover:text-[#78C4EC] transition">日本現場實拍</a>
          <a href="#contact" className="hover:text-[#78C4EC] transition">客服諮詢</a>
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#78C4EC] bg-[#bbe3f8] hover:bg-[#a8d0f0] px-3 py-1.5 rounded-full hover:bg-[#78C4EC] hover:text-white transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            立即探索日本好物
          </button>
          
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="選單"
            className="text-[#78C4EC] transition p-1"
          >
            {menuOpen ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

            {/* 3. 全螢幕漢堡分類選單 */}
      {menuOpen && (
        <div className="fixed inset-0 top-[110px] bg-white z-40 overflow-y-auto px-6 py-8 shadow-2xl">
          <div className="max-w-md mx-auto bg-[#78C4EC] hover:bg-[#6db3e0] text-white py-3 px-6 rounded-xl font-medium text-sm mb-6 shadow-sm">
            YUKI & TOMOYA 專屬選單
          </div>
          <div className="max-w-md mx-auto divide-y divide-[#E5F3FC] text-[#6d6d6d] text-base font-medium">
            {[
              { title: "代購流程", items: ["如何許願", "費用計算", "國際運送"] },
              { title: "三大日本嚴選代購專區", items: ["STATIONERY 文具教材", "EDUCATION 益智教具", "GOODS 質感小物"] },
              { title: "日本現場實拍", items: ["連線動態", "職人實地採購"] },
              { title: "線上客服", items: ["專人 LINE 諮詢"] },
            ].map((section, idx) => (
              <div key={idx} className="py-4 flex flex-col gap-2">
                <div className="flex items-center justify-between cursor-pointer hover:text-[#78C4EC]">
                  <span>{section.title}</span>
                  <span className="text-xl font-light text-[#78C4EC]">+</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Hero 主視覺（動態顯示 Redis 主標題） */}
      <main className="flex-1">
        {isPreviewMode && (
          <div className="bg-[#78C4EC] text-white text-center py-3 font-bold text-sm shadow-md animate-pulse z-50 relative">
            🎬 目前為【AI 製片審核預覽模式】（尚未公開，確認無誤請回 LINE 輸入『確認上架影片』）
          </div>
        )}
        <div className="bg-[#78C4EC] hover:bg-[#6db3e0] text-white text-center pb-4 pt-1 relative">
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[16px] border-t-[#78C4EC] z-30"></div>
        </div>
        <section
          className="relative h-[520px] sm:h-[600px] flex flex-col justify-center items-center text-center transition-all duration-700 overflow-hidden bg-[#F2F2F2]"
        >
          {siteHeroImage ? (
            siteHeroImage.match(/\.(mp4|webm)(\?.*)?$/i) ? (
              <video src={siteHeroImage} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" />
            ) : (
              <img src={siteHeroImage} alt="Hero Background" className="absolute inset-0 w-full h-full object-cover z-0" />
            )
          ) : (
            <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-br from-[#E6F3FA] to-[#78C4EC] [background-image:linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:24px_24px]" />
          )}

          <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-[#1A1A1A]/70 z-10" />

          <div className="relative z-20 max-w-4xl w-full mx-auto px-6 flex flex-col items-center mt-32">
            <div className="inline-block px-5 py-2 mb-4 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase bg-[#78C4EC] hover:bg-[#6db3e0] text-white shadow-md">
              + YUKI & TOMOYA JAPAN DIRECT +
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight drop-shadow-md">
              {siteTitle}
            </h1>
            <p className="text-white text-sm sm:text-base max-w-2xl font-medium leading-relaxed tracking-wide drop-shadow">
              嚴選日本棒壘運動裝備、公文教材文具、家庭保健益生菌與日本質感生活百貨。
            </p>
          </div>
        </section>

        {/* 宣傳影片區塊 */}
        {sitePromoVideo !== "hidden" && (
          <section id="video" className="bg-[#EBF6FC] py-16 px-6 border-b border-[#6db3e0]">
            <div className="max-w-5xl mx-auto flex flex-col items-center">
              <div className="inline-block px-4 py-1.5 mb-6 rounded-full text-[11px] font-bold tracking-widest text-[#78C4EC] bg-white border border-[#C8A878]/30 uppercase shadow-sm">
                {sitePromoVideoTitle}
              </div>

              {(() => {
                const ytMatch = sitePromoVideo.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([^"&?\/\s]{11})/i);
                if (ytMatch) {
                  const ytId = ytMatch[1];
                  const isShorts = sitePromoVideo.toLowerCase().includes('/shorts/');
                  const ytContainerClass = isShorts
                    ? "max-w-[360px] mx-auto w-full aspect-[9/16] rounded-2xl shadow-2xl border border-[#C8A97E]/30"
                    : "w-full max-w-4xl mx-auto aspect-video rounded-2xl shadow-2xl border border-[#C8A97E]/30";

                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&playsinline=1`}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className={ytContainerClass}
                    />
                  );
                } else {
                  if (isScreenshotMode && sitePromoPoster) {
                    const screenshotContainerClass = isVerticalVideo
                      ? "max-w-[360px] mx-auto w-full relative overflow-hidden"
                      : "max-w-4xl mx-auto w-full relative overflow-hidden";

                    return (
                      <div className={screenshotContainerClass}>
                        <img
                          src={sitePromoPoster}
                          alt="Video Poster"
                          onLoad={(e) => setIsVerticalVideo(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth)}
                          className="w-full h-auto block rounded-2xl shadow-xl border-4 border-white ring-1 ring-[#bbe3f8]/40"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-2xl m-1">
                          <div className="w-16 h-16 bg-[#78C4EC]/80 backdrop-blur-md rounded-full flex items-center justify-center border border-white/80 shadow-lg">
                            <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-2"></div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <AiVideoPlayer videoUrl={sitePromoVideo} aiScript={aiScript} poster={sitePromoPoster || undefined} />
                  );
                }
              })()}
            </div>
          </section>
        )}

        {/* 八大日本代購嚴選專區 */}
        <section id="categories" className="bg-white max-w-7xl mx-auto px-6 sm:px-8 pt-20 pb-16">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-[#6d6d6d] mb-3">
              Categories & Selection.
            </h2>
            <p className="text-[#78C4EC] font-bold text-sm tracking-widest uppercase bg-[#bbe3f8] hover:bg-[#a8d0f0] inline-block px-4 py-1.5 rounded-full">
              ユキ&トモヤ 三大日本嚴選代購專區
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#6db3e0] flex flex-col group cursor-pointer">
                <div className="h-52 overflow-hidden relative bg-[#F2F2F2]">
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-xs font-extrabold text-[#78C4EC] shadow-sm border border-[#6db3e0]">
                      {item.id}.
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-bold text-[#6d6d6d] tracking-wider shadow-sm">
                      {item.tag}
                    </div>
                  </div>
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between bg-white relative">
                  <div className="absolute -top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md z-20 group-hover:-translate-y-1 transition border border-[#6db3e0]">
                    <svg className="w-5 h-5 text-[#78C4EC]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#6d6d6d] mb-2.5 leading-snug">{item.title}</h3>
                    <p className="text-[13px] text-stone-500 leading-relaxed font-medium">{item.desc}</p>
                  </div>

                  <details className="group mt-4 border-t border-slate-100 pt-4">
                    <summary className="text-sm font-bold text-white bg-[#78C4EC] hover:bg-[#6db3e0] px-4 py-2 rounded-full cursor-pointer list-none flex items-center justify-between shadow-sm transition text-center w-full">
                      <span className="w-full">✨ 查看本區精選商品（共 {item.products.length} 款） ▾</span>
                    </summary>
                    <div className="mt-4 flex flex-col gap-4">
                      {item.products.map((product) => (
                        <div key={product.id} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#6db3e0] transition">
                          <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-white shadow-sm">
                            <img src={product.imageUrl || "https://images.unsplash.com/photo-1540340061722-9293d5163008?w=400&q=80"} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0 justify-center">
                            <h4 className="text-sm font-bold text-stone-700 truncate">{product.name}</h4>
                            <span className="inline-block self-start mt-1 mb-1 px-2 py-0.5 bg-[#78C4EC] text-white text-[11px] font-bold rounded-sm shadow-sm">{product.price}</span>
                            <p className="text-[11px] text-stone-500 line-clamp-2">{product.desc}</p>
                            <a href="https://line.me" target="_blank" rel="noopener noreferrer" className="mt-2 text-[11px] font-bold text-[#78C4EC] hover:text-[#56A8D6] transition">💬 點此用 LINE 詢問／下單此商品 →</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-[13px] font-bold text-[#78C4EC] group-hover:text-[#56A8D6] transition">LINE 傳圖詢價 →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 5. 底部 Footer */}
      <footer className="bg-[#EBF6FC] border-t border-[#6db3e0] text-[#6d6d6d] py-12 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#78C4EC] flex items-center justify-center font-bold text-white text-lg shadow-sm border-2 border-white">
                Y&T
              </div>
              <span className="font-bold tracking-widest text-lg text-[#6d6d6d]">
                ユキ&トモヤ
              </span>
            </div>
            <p className="text-[12px] text-stone-500 leading-relaxed">
              YUKI & TOMOYA JAPAN SELECT<br/>
              專營日本最新人氣商品、限定品代購與現地連線。<br/>
              日本境內直達，安全安心。
            </p>
          </div>

          <div id="contact">
            <div className="font-bold text-[#78C4EC] text-sm mb-4 tracking-wider">聯絡我們</div>
            <div className="space-y-3 text-sm text-stone-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                LINE 官方帳號：@yuki_tomoya
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#78C4EC]"></span>
                客服時間：10:00 - 20:00 (JST)
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold text-[#78C4EC] text-sm mb-4 tracking-wider">快速導覽</div>
            <ul className="space-y-2 text-sm text-stone-600 font-medium">
              <li><a href="#categories" className="hover:text-[#78C4EC] transition">嚴選品類</a></li>
              <li><a href="#video" className="hover:text-[#78C4EC] transition">現場實拍</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-[#C8A878]/20 pt-6 text-center text-[11px] text-stone-500 font-medium tracking-wide">
          <p>Copyright © 2026 YUKI & TOMOYA JAPAN SELECT. All rights reserved.</p>
        </div>
      </footer>

      {/* 6. 底部固定四格導覽列（KUMON 風格） */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-[56px] bg-[#bbe3f8] hover:bg-[#a8d0f0] border-t border-[#C8A878]/30 flex items-stretch shadow-[0_-4px_10px_rgba(0,0,0,0.03)] pb-safe md:hidden">
        <a
          href="https://line.me"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#6d6d6d] hover:bg-[#78C4EC]/10 transition relative after:content-[''] after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-[1px] after:bg-white"
        >
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#78C4EC]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>
          <span className="text-[10px] font-bold tracking-wide mt-0.5">LINE 傳圖許願</span>
        </a>
        <a
          href="#categories"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#6d6d6d] hover:bg-[#78C4EC]/10 transition relative after:content-[''] after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-[1px] after:bg-white"
        >
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#78C4EC]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2B857]"></span>
          </div>
          <span className="text-[10px] font-bold tracking-wide mt-0.5">三大嚴選分類</span>
        </a>
        <a
          href="#video"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#6d6d6d] hover:bg-[#78C4EC]/10 transition relative after:content-[''] after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-[1px] after:bg-white"
        >
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F29B9B]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#78C4EC]"></span>
          </div>
          <span className="text-[10px] font-bold tracking-wide mt-0.5">日本連線影片</span>
        </a>
        <button
          onClick={() => setContactOpen(!contactOpen)}
          aria-label="展開"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#6d6d6d] hover:bg-[#78C4EC]/10 transition"
        >
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2B857]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F29B9B]"></span>
          </div>
          <span className="text-[10px] font-bold tracking-wide mt-0.5">聯絡客服諮詢</span>
        </button>
      </nav>

      {/* 7. 右下角彈出選單 */}
      {contactOpen && (
        <div className="fixed bottom-[70px] right-3 z-50 bg-white rounded-2xl shadow-xl border border-[#6db3e0] p-4 w-[240px]">
          <div className="text-xs font-bold text-[#78C4EC] mb-3 pb-2 border-b border-[#6db3e0] flex items-center justify-between">
            <span>聯絡客服</span>
            <span className="cursor-pointer text-stone-400 hover:text-stone-600 text-sm" onClick={() => setContactOpen(false)}>✕</span>
          </div>
          <div className="flex flex-col gap-2.5 text-xs">
            <a href="https://line.me" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#EBF6FC] text-stone-700 font-medium transition">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
              <span>LINE 官方客服</span>
            </a>
            <a href="#about" onClick={() => setContactOpen(false)} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#EBF6FC] text-stone-700 font-medium transition">
              <span className="w-2.5 h-2.5 rounded-full bg-[#78C4EC] shadow-sm" />
              <span>查看代購流程說明</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
