/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // 動態綁定 Redis 的網站主標題、頂部公告與連結
  const [siteTitle, setSiteTitle] = useState("日本職人好物・安心直送台灣");
  const [siteAnnouncement, setSiteAnnouncement] = useState("✈️ ユキ&トモヤ 日本現地連線代購中！運動裝備・文具教材・保健益生菌・日本直送");
  const [siteAnnouncementUrl, setSiteAnnouncementUrl] = useState("");

  // 動態綁定網站主視覺背景
  const [siteHeroImage, setSiteHeroImage] = useState("https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1080&auto=format&fit=crop"); // 東京街景

  // 動態綁定影片區塊
  const [sitePromoVideo, setSitePromoVideo] = useState("https://assets.mixkit.co/videos/preview/mixkit-pouring-coffee-into-a-cup-41545-large.mp4");
  const [sitePromoVideoTitle, setSitePromoVideoTitle] = useState("FEATURED VIDEO ｜ ユキ&トモヤ 日本現場連線實拍");

  // 分類圖片
  const [catImg1, setCatImg1] = useState("https://images.unsplash.com/photo-1508344928928-7165b67de128?q=80&w=800&auto=format&fit=crop"); // 運動
  const [catImg2, setCatImg2] = useState("https://images.unsplash.com/photo-1568205612837-017257d2310a?q=80&w=800&auto=format&fit=crop"); // 文具
  const [catImg3, setCatImg3] = useState("https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop"); // 保健
  const [catImg4, setCatImg4] = useState("https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop"); // 日常
  const [catImg5, setCatImg5] = useState("https://images.unsplash.com/photo-1599599810694-b5b37304c041?q=80&w=800&auto=format&fit=crop"); // 零食
  const [catImg6, setCatImg6] = useState("https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800&auto=format&fit=crop"); // 服飾
  const [catImg7, setCatImg7] = useState("https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop"); // 精品
  const [catImg8, setCatImg8] = useState("https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop"); // 文創

  const [isVerticalVideo, setIsVerticalVideo] = useState(false);

  // 截圖與封面圖模式支援
  const [sitePromoPoster, setSitePromoPoster] = useState("");
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);

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
        if (data?.cat_img_4) setCatImg4(data.cat_img_4);
        if (data?.cat_img_5) setCatImg5(data.cat_img_5);
        if (data?.cat_img_6) setCatImg6(data.cat_img_6);
        if (data?.cat_img_7) setCatImg7(data.cat_img_7);
        if (data?.cat_img_8) setCatImg8(data.cat_img_8);
      })
      .catch((err) => console.error("讀取網站動態設定失敗:", err));
  }, []);

  // 八大日本代購嚴選專區
  const categories = [
    { id: 1, title: "日本運動用品嚴選", desc: "棒壘球實戰裝備（日規手套、球棒、打擊配件）及其他專業運動護具用品。", tag: "SPORTS", img: catImg1 },
    { id: 2, title: "日本文具與教材用品", desc: "日本益智教材、KOKUYO、Pilot、三菱 Uni 等日本大賞機能文具與學用品。", tag: "STATIONERY", img: catImg2 },
    { id: 3, title: "日本營養保健＆益生菌", desc: "符合進出口規範之日本大廠保健食品、家庭常備機能益生菌與日常營養補給。", tag: "HEALTH", img: catImg3 },
    { id: 4, title: "日本日常生活＆電器商品", desc: "日本空間芳香劑、高階充電電池、人氣居家實用小家電與日用品。", tag: "DAILY & TECH", img: catImg4 },
    { id: 5, title: "日本熱門零食＆飲品", desc: "日本各地人氣餅乾、季節限定糖果、伴手禮盒與精選沖泡飲品。", tag: "SNACKS", img: catImg5 },
    { id: 6, title: "日本休閒服飾（男／女／童）", desc: "日系機能與日常百搭服飾，涵蓋男裝、女裝與舒適耐穿的兒童穿搭。", tag: "APPAREL", img: catImg6 },
    { id: 7, title: "日本精品＆質感鍋碗餐具", desc: "日本平價輕奢飾品、美濃燒／有田燒精緻鍋碗盤餐具與廚房美學器皿。", tag: "BOUTIQUE", img: catImg7 },
    { id: 8, title: "日本文創＆特殊創意商品", desc: "日本各地限定文創小物、特色設計雜貨與精美創意禮品。", tag: "CREATIVE", img: catImg8 },
  ];


  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col font-sans relative pb-16 md:pb-0">
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
      <aside className="bg-[#78C4EC] text-white text-xs sm:text-sm py-2 px-4 text-center overflow-hidden shadow-sm relative z-50">
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
      <header className="bg-white border-b border-[#E5F3FC] sticky top-0 z-40 px-6 sm:px-10 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#78C4EC] flex items-center justify-center font-bold text-white text-lg shadow-sm border-2 border-white">
            Y&T
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-widest text-lg text-[#1A1A1A]">
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
          <button className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#78C4EC] bg-[#E5F3FC] px-3 py-1.5 rounded-full hover:bg-[#78C4EC] hover:text-white transition">
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
          <div className="max-w-md mx-auto bg-[#78C4EC] text-white py-3 px-6 rounded-xl font-medium text-sm mb-6 shadow-sm">
            YUKI & TOMOYA 專屬選單
          </div>
          <div className="max-w-md mx-auto divide-y divide-[#E5F3FC] text-[#1A1A1A] text-base font-medium">
            {[
              { title: "代購流程", items: ["如何許願", "費用計算", "國際運送"] },
              { title: "八大日本嚴選代購品類", items: ["SPORTS 運動用品", "STATIONERY 文具教材", "HEALTH 保健益生菌", "DAILY 日常電器", "SNACKS 零食飲品", "APPAREL 服飾穿搭", "BOUTIQUE 精品餐具", "CREATIVE 文創設計"] },
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
        <div className="bg-[#78C4EC] text-white text-center pb-4 pt-1 relative">
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
            <div className="inline-block px-5 py-2 mb-4 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase bg-[#78C4EC] text-white shadow-md">
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
          <section id="video" className="bg-[#EBF6FC] py-16 px-6 border-b border-[#E5F3FC]">
            <div className="max-w-5xl mx-auto flex flex-col items-center">
              <div className="inline-block px-4 py-1.5 mb-6 rounded-full text-[11px] font-bold tracking-widest text-[#78C4EC] bg-white border border-[#78C4EC]/30 uppercase shadow-sm">
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
                  const videoClass = isVerticalVideo
                    ? "max-w-[360px] w-full mx-auto aspect-[9/16] object-contain bg-black rounded-2xl shadow-xl border-4 border-white ring-1 ring-[#78C4EC]/40"
                    : "w-full max-w-4xl mx-auto aspect-video object-contain bg-black rounded-2xl shadow-xl border-4 border-white ring-1 ring-[#78C4EC]/40";

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
                          className="w-full h-auto block rounded-2xl shadow-xl border-4 border-white ring-1 ring-[#78C4EC]/40"
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
                    <video
                      key={sitePromoVideo}
                      src={sitePromoVideo}
                      poster={sitePromoPoster || undefined}
                      preload="metadata"
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      onLoadedMetadata={(e) => setIsVerticalVideo(e.currentTarget.videoHeight > e.currentTarget.videoWidth)}
                      className={videoClass}
                    />
                  );
                }
              })()}
            </div>
          </section>
        )}

        {/* 八大日本代購嚴選專區 */}
        <section id="categories" className="bg-white max-w-7xl mx-auto px-6 sm:px-8 pt-20 pb-16">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-[#1A1A1A] mb-3">
              Categories & Selection.
            </h2>
            <p className="text-[#78C4EC] font-bold text-sm tracking-widest uppercase bg-[#E5F3FC] inline-block px-4 py-1.5 rounded-full">
              ユキ&トモヤ 八大日本嚴選代購品類
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#E5F3FC] flex flex-col group cursor-pointer">
                <div className="h-52 overflow-hidden relative bg-[#F2F2F2]">
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-xs font-extrabold text-[#78C4EC] shadow-sm border border-[#E5F3FC]">
                      {item.id}.
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-bold text-[#1A1A1A] tracking-wider shadow-sm">
                      {item.tag}
                    </div>
                  </div>
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between bg-white relative">
                  <div className="absolute -top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md z-20 group-hover:-translate-y-1 transition border border-[#E5F3FC]">
                    <svg className="w-5 h-5 text-[#78C4EC]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2.5 leading-snug">{item.title}</h3>
                    <p className="text-[13px] text-stone-500 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#78C4EC] group-hover:text-[#56A8D6] transition">LINE 傳圖詢價 →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 5. 底部 Footer */}
      <footer className="bg-[#EBF6FC] border-t border-[#E5F3FC] text-[#1A1A1A] py-12 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#78C4EC] flex items-center justify-center font-bold text-white text-lg shadow-sm border-2 border-white">
                Y&T
              </div>
              <span className="font-bold tracking-widest text-lg text-[#1A1A1A]">
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

        <div className="max-w-7xl mx-auto border-t border-[#78C4EC]/20 pt-6 text-center text-[11px] text-stone-500 font-medium tracking-wide">
          <p>Copyright © 2026 YUKI & TOMOYA JAPAN SELECT. All rights reserved.</p>
        </div>
      </footer>

      {/* 6. 底部固定四格導覽列（KUMON 風格） */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-[56px] bg-[#E5F3FC] border-t border-[#78C4EC]/30 flex items-stretch shadow-[0_-4px_10px_rgba(0,0,0,0.03)] pb-safe md:hidden">
        <a
          href="https://line.me"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#1A1A1A] hover:bg-[#78C4EC]/10 transition relative after:content-[''] after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-[1px] after:bg-white"
        >
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#78C4EC]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>
          <span className="text-[10px] font-bold tracking-wide mt-0.5">LINE 立即探索日本好物</span>
        </a>
        <a
          href="#categories"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#1A1A1A] hover:bg-[#78C4EC]/10 transition relative after:content-[''] after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-[1px] after:bg-white"
        >
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#78C4EC]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2B857]"></span>
          </div>
          <span className="text-[10px] font-bold tracking-wide mt-0.5">八大嚴選分類</span>
        </a>
        <a
          href="#video"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#1A1A1A] hover:bg-[#78C4EC]/10 transition relative after:content-[''] after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-[1px] after:bg-white"
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
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#1A1A1A] hover:bg-[#78C4EC]/10 transition"
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
        <div className="fixed bottom-[70px] right-3 z-50 bg-white rounded-2xl shadow-xl border border-[#E5F3FC] p-4 w-[240px]">
          <div className="text-xs font-bold text-[#78C4EC] mb-3 pb-2 border-b border-[#E5F3FC] flex items-center justify-between">
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
