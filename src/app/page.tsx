"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useMemo } from "react";
import AiVideoPlayer from "@/components/AiVideoPlayer";
import { CategoryItem, ProductItem, DEFAULT_CATEGORIES, DEFAULT_PRODUCTS_CATALOG } from "@/types/ecommerce";
import type { CartItem } from '@/lib/shop-db';
import CartCheckoutModal from '@/components/CartCheckoutModal';
import WishFormSection from '@/components/WishFormSection';
import { Menu, X, ShoppingCart, MessageCircle, Plus, Minus } from 'lucide-react';


export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // 動態綁定 Redis 的網站主標題、頂部公告與連結
  const [lineOfficialUrl, setLineOfficialUrl] = useState("https://lin.ee/VFh69eyZ");
  const [siteTitle, setSiteTitle] = useState("日本職人好物・安心直送台灣");
  const [siteAnnouncement, setSiteAnnouncement] = useState("✈️ ユキ&トモヤ 日本現地連線代購中！棒壘運動裝備・文具教具・家庭保健・日本直送");
  const [siteAnnouncementUrl, setSiteAnnouncementUrl] = useState("");

  // 動態綁定網站主視覺背景
  const [siteHeroImage, setSiteHeroImage] = useState("");

  // 動態綁定影片區塊
  const [videoUrls, setVideoUrls] = useState<string[]>(['/preview-clip-1.mp4', '/preview-clip-2.mp4', '/preview-clip-3.mp4']);
  const [sitePromoVideo, setSitePromoVideo] = useState("https://assets.mixkit.co/videos/preview/mixkit-pouring-coffee-into-a-cup-41545-large.mp4");
  const [sitePromoVideoTitle, setSitePromoVideoTitle] = useState("FEATURED VIDEO ｜ ユキ&トモヤ 日本現場連線實拍");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiScript, setAiScript] = useState<any>(null);

  // 動態分類與商品資料庫
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS_CATALOG);

  // 尋物控制中心狀態（搜尋關鍵字、選中分類 ID、選中狀態標籤）

  const [searchKeyword, setSearchKeyword] = useState("");

  // Shopping Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('yt_cart');
      if (saved) setCartItems(JSON.parse(saved));
    } catch (e) {}
  }, []);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('yt_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: ProductItem, spec: string, qty: number) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.spec === spec);
      if (existing) {
        return prev.map(item => item.id === product.id && item.spec === spec ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        spec: spec || (product.specs && product.specs[0]) || '標準規格',
        price: product.price,
        quantity: qty,
        imageUrl: product.images[0]
      }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeCartItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_stock" | "preorder" | "sendai_pickup">("all");

  // 商品詳情彈跳視窗（Product Detail Modal）狀態
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<string>("");
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [cartSuccessFeedback, setCartSuccessFeedback] = useState<string | null>(null);

  const [isVerticalVideo, setIsVerticalVideo] = useState(false);

  // 截圖與封面圖模式支援
  const [sitePromoPoster, setSitePromoPoster] = useState("");
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);

  // 預覽模式
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // 1. 若網址帶有即時預覽參數，優先同步顯示
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

    // 2. 向後端 API 讀取 Redis 最新設定（包含動態分類與商品目錄）
    fetch(`/api/line?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.line_official_url) setLineOfficialUrl(data.line_official_url);
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
        if (data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }

        const isPreview = new URLSearchParams(window.location.search).get("preview") === "video";
        if (isPreview) {
          setIsPreviewMode(true);
          if (data?.preview_video_urls?.length > 0) {
            setVideoUrls(data.preview_video_urls);
            setSitePromoVideo(data.preview_video_urls[0]);
          } else if (data?.preview_video) {
            setSitePromoVideo(data.preview_video);
          }
          if (data?.preview_ai_script) setAiScript(data.preview_ai_script);
        } else {
          if (data?.video_urls?.length > 0) {
            setVideoUrls(data.video_urls);
            setSitePromoVideo(data.video_urls[0]);
          }
          if (data?.video_ai_script) setAiScript(data.video_ai_script);
        }
      })
      .catch((err) => console.error("讀取網站動態設定失敗:", err));
  }, []);

  // 當開啟特定商品詳情視窗時，預設選取第一個規格
  const openProductDetail = (product: ProductItem) => {
    setSelectedProduct(product);
    setSelectedSpec(product.specs && product.specs.length > 0 ? product.specs[0] : "");
    setOrderQuantity(1);
    setCartSuccessFeedback(null);
  };

  // 即時計算篩選後的商品清單
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. 分類篩選
      if (selectedCategoryId !== "all" && item.categoryId !== selectedCategoryId) {
        return false;
      }

      // 2. 狀態篩選
      if (statusFilter === "in_stock" && item.status !== "in_stock") return false;
      if (statusFilter === "preorder" && item.status !== "preorder") return false;
      if (statusFilter === "sendai_pickup" && !item.allowSendaiPickup) return false;



      // 3. 關鍵字搜尋（品名、分類名、描述）
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(kw);
        const matchCategory = item.categoryName.toLowerCase().includes(kw);
        const matchSubCategory = (item.subCategory || '').toLowerCase().includes(kw);
        const matchDesc = item.description.toLowerCase().includes(kw);
        const matchSpecs = item.specs?.some(s => s.toLowerCase().includes(kw));
        const matchTags = item.badges?.some(b => b.toLowerCase().includes(kw));

        if (!matchName && !matchCategory && !matchSubCategory && !matchDesc && !matchSpecs && !matchTags) {
          return false;
        }
      }



      return true;
    });
  }, [products, selectedCategoryId, statusFilter, searchKeyword]);

  // 取得目前選中分類的物件
  const activeCategoryObject = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  // 處理加入代購清單（Step 2 前哨銜接）
  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const itemData = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      spec: selectedSpec,
      quantity: orderQuantity,
      unitPrice: selectedProduct.price,
      totalPrice: selectedProduct.price * orderQuantity,
      addedAt: Date.now()
    };

    try {
      const existing = localStorage.getItem("yt_cart_items");
      const list = existing ? JSON.parse(existing) : [];
      list.push(itemData);
      localStorage.setItem("yt_cart_items", JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    setCartSuccessFeedback(`已成功加入代購清單：${selectedProduct.name}（${selectedSpec || "標準規格"}）x ${orderQuantity} 件！`);
    setTimeout(() => {
      setCartSuccessFeedback(null);
    }, 4000);
  };

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

      {/* 1. 頂部公告欄 */}
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
          <a href="#search-section" className="hover:text-[#78C4EC] transition font-bold text-[#78C4EC]">🔍 尋物搜尋</a>
          <a href="#categories" className="hover:text-[#78C4EC] transition">五大核心分類</a>
          <a href="#products-grid" className="hover:text-[#78C4EC] transition">嚴選商品清單</a>
          <a href="#video" className="hover:text-[#78C4EC] transition">日本現場實拍</a>
          <a href="#contact" className="hover:text-[#78C4EC] transition">代購諮詢</a>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={lineOfficialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#78C4EC] bg-[#bbe3f8] hover:bg-[#a8d0f0] px-3.5 py-1.5 rounded-full hover:bg-[#78C4EC] hover:text-white transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            ＋ 加入 LINE 好友
          </a>
          
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
            YUKI & TOMOYA 專屬導覽
          </div>
          <div className="max-w-md mx-auto divide-y divide-[#E5F3FC] text-[#6d6d6d] text-base font-medium">
            <div className="py-3">
              <span className="text-xs font-bold text-[#78C4EC] block mb-2">動態嚴選分類專區</span>
              <div className="grid grid-cols-1 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                          setSearchKeyword("");
                      setMenuOpen(false);
                      const el = document.getElementById("search-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-[#EBF6FC] text-stone-700 text-sm flex items-center justify-between"
                  >
                    <span>{cat.title}</span>
                    <span className="text-xs text-stone-400">{cat.enTitle}</span>
                  </button>
                ))}
              </div>
            </div>
            {[
              { title: "全站尋物搜尋與篩選", id: "search-section" },
              { title: "嚴選商品網格櫥窗", id: "products-grid" },
              { title: "日本連線實拍影片", id: "video" },
              { title: "客服與海關物流諮詢", id: "contact" },
            ].map((section, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between cursor-pointer hover:text-[#78C4EC]" onClick={() => {
                setMenuOpen(false);
                const el = document.getElementById(section.id);
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}>
                <span>{section.title}</span>
                <span className="text-xl font-light text-[#78C4EC]">→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Hero 主視覺 */}
      <main className="flex-1">
        {isPreviewMode && (
          <div className="bg-[#78C4EC] text-white text-center py-3 font-bold text-sm shadow-md animate-pulse z-50 relative">
            🎬 目前為【AI 製片審核預覽模式】（尚未公開，確認無誤請回 LINE 輸入『確認上架影片』）
          </div>
        )}
        <div className="bg-[#78C4EC] hover:bg-[#6db3e0] text-white text-center pb-4 pt-1 relative">
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[16px] border-t-[#78C4EC] z-30"></div>
        </div>
        <section className="relative h-[520px] sm:h-[600px] flex flex-col justify-center items-center text-center transition-all duration-700 overflow-hidden bg-[#F2F2F2]">
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

          <div className="relative z-20 max-w-4xl w-full mx-auto px-6 flex flex-col items-center mt-28">
            <div className="inline-block px-5 py-2 mb-4 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase bg-[#78C4EC] hover:bg-[#6db3e0] text-white shadow-md">
              + YUKI & TOMOYA JAPAN DIRECT SELECT +
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight drop-shadow-md">
              {siteTitle}
            </h1>
            <p className="text-white text-sm sm:text-base max-w-2xl font-medium leading-relaxed tracking-wide drop-shadow">
              由仙台現地出發，嚴選日本職棒等級棒壘運動裝備、機能文具用品、學齡幼兒多元品牌益智教具、日常家庭保健食品與在地工藝文創小物。
            </p>

            {/* 入口 A：Hero 主視覺中央醒目加好友按鈕 */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <a
                href={lineOfficialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#06C755] hover:bg-[#05b34c] text-white font-bold px-7 py-3.5 rounded-full shadow-lg flex items-center gap-2.5 transition transform hover:scale-105"
              >
                💬 加入官方 LINE・一對一詢價許願 ↗
              </a>
              <a
                href="#search-section"
                className="bg-white/90 hover:bg-white text-stone-800 font-bold px-6 py-3.5 rounded-full shadow-md backdrop-blur transition flex items-center gap-2"
              >
                🔍 前往全站尋物搜尋
              </a>
            </div>
          </div>
        </section>

        {/* 宣傳影片區塊 */}
        {sitePromoVideo !== "hidden" && (
          <section id="video" className="bg-[#EBF6FC] py-14 px-6 border-b border-[#6db3e0]">
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
                    <AiVideoPlayer videoUrl={sitePromoVideo} videoUrls={videoUrls} aiScript={aiScript} poster={sitePromoPoster || undefined} />
                  );
                }
              })()}
            </div>
          </section>
        )}

        {/* =========================================================================
            【任務三：尋物與篩選控制中心 (Search & Filter Control Center)】
            包含：即時關鍵字搜尋框 ＋ 動態延展膠囊列 ＋ 供貨/取貨狀態切換
        ========================================================================= */}
        <section id="search-section" className="bg-[#FAFDFE] border-b border-[#E5F3FC] py-12 px-4 sm:px-8 scroll-mt-20">
          <div className="max-w-7xl mx-auto space-y-7">
            {/* 標題與引言 */}
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold text-[#78C4EC] tracking-widest uppercase bg-[#bbe3f8]/60 px-3 py-1 rounded-full">
                DYNAMIC SELECT & SEARCH
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#525252] mt-2">
                全站尋物搜尋與篩選中心
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1.5 font-medium">
                支援品類切換、台幣一口價透明標示、供貨現貨篩選與仙台店面取貨快速導覽
              </p>
            </div>

            {/* 控制列本體 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#6db3e0]/40 space-y-6">
              {/* 關鍵字搜尋框 */}
              <div className="relative max-w-3xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#78C4EC]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSelectedCategoryId("all");
                        const el = document.getElementById("products-grid");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    placeholder="輸入商品名稱、分類關鍵字（如：棒球手套、 Campus、益智拼圖、酵素、仙台...）"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#78C4EC] focus:border-transparent transition shadow-inner"
                  />
                  {searchKeyword && (
                    <button
                      onClick={() => {
                        setSearchKeyword("");
                        setSelectedCategoryId("all");
                        const el = document.getElementById("products-grid");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600 transition"
                      title="清除搜尋"
                    >
                      <X size={20} />
                    </button>
                  )}

              </div>

              {/* 動態分類切換膠囊列（Dynamic Category Tabs - 支援未來無限擴充自動換行） */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-500 px-1">
                  <span>分類切換（支援彈性擴充，共 {categories.length} 大核心分類）</span>
                  {selectedCategoryId !== "all" && (
                    <button
                      onClick={() => setSelectedCategoryId("all")}
                      className="text-[#78C4EC] hover:underline"
                    >
                      重設為全部分類
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <button
                    onClick={() => setSelectedCategoryId("all")}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                      selectedCategoryId === "all"
                        ? "bg-[#78C4EC] text-white shadow-md scale-105"
                        : "bg-slate-100 text-stone-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>🌟 全部嚴選</span>
                    <span className="text-[10px] opacity-80">({products.length})</span>
                  </button>

                  {categories.map((cat) => {
                    const count = products.filter((p) => p.categoryId === cat.id).length;
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-[#78C4EC] text-white shadow-md scale-105"
                            : "bg-slate-100 text-stone-600 hover:bg-slate-200"
                        }`}
                      >
                        <span>{cat.title}</span>
                        <span className="text-[10px] opacity-80">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 供貨狀態與取貨方式篩選（Status Filter） */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-stone-400 mr-2">物流與供貨篩選：</span>
                {[
                  { key: "all", label: "全部狀態" },
                  { key: "in_stock", label: "🟢 台灣現貨" },
                  { key: "preorder", label: "✈️ 日本連線預購" },
                  { key: "sendai_pickup", label: "🏪 支援仙台店面取貨" },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setStatusFilter(st.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      statusFilter === st.key
                        ? "bg-[#6d6d6d] text-white shadow-sm"
                        : "bg-slate-50 text-stone-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            【動態分類主題導覽卡專區】
        ========================================================================= */}
        <section id="categories" className="bg-white max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-[#6d6d6d] mb-2">
              Categories & Selection.
            </h2>
            <p className="text-[#78C4EC] font-bold text-xs sm:text-sm tracking-widest uppercase bg-[#bbe3f8] hover:bg-[#a8d0f0] inline-block px-4 py-1.5 rounded-full">
              ユキ&トモヤ 日本五大核心嚴選品類
            </p>
            <p className="text-stone-400 text-xs mt-2">點擊各分類卡片可自動在下方展開該類專屬櫥窗</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {categories.map((item) => {
              const matchedProducts = products.filter((p) => p.categoryId === item.id);
              const isSelected = selectedCategoryId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedCategoryId(item.id);
                    setSearchKeyword("");
                    const el = document.getElementById("products-grid");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border flex flex-col group cursor-pointer ${
                    isSelected ? "border-[#78C4EC] ring-2 ring-[#78C4EC]/30" : "border-[#6db3e0]/50"
                  }`}
                >
                  <div className="h-52 overflow-hidden relative bg-[#F2F2F2]">
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      <div className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-xs font-extrabold text-[#78C4EC] shadow-sm border border-[#6db3e0]/50">
                        No. {item.order}
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-[10px] font-bold text-[#6d6d6d] tracking-wider shadow-sm">
                        {item.enTitle}
                      </div>
                    </div>
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      <h3 className="text-lg font-bold text-[#6d6d6d] mb-2 leading-snug group-hover:text-[#78C4EC] transition">
                        {item.title}
                      </h3>
                      <p className="text-[13px] text-stone-500 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#78C4EC]">
                        查看此分類（共 {matchedProducts.length} 款） →
                      </span>
                      <span className="text-[11px] text-stone-400 font-semibold">
                        一口價＋含服務費
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            【任務二 & 三：即時篩選商品網格 (Product Grid) ＋ 台幣一口價標示】
        ========================================================================= */}
        <section id="products-grid" className="bg-[#FAFDFE] border-t border-[#E5F3FC] py-16 px-6 sm:px-8 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            {/* 標題與目前篩選狀態 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-extrabold text-stone-800">
                    {activeCategoryObject ? activeCategoryObject.title : "全站代購商品總覽"}
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#78C4EC] text-white">
                    {filteredProducts.length} 款嚴選好物
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {activeCategoryObject ? activeCategoryObject.description : "依據上方搜尋關鍵字與供貨條件即時呈現"}
                </p>
              </div>

              {(selectedCategoryId !== "all" || searchKeyword || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSelectedCategoryId("all");
                    setSearchKeyword("");
                    setStatusFilter("all");
                  }}
                  className="self-start sm:self-auto text-xs font-bold text-[#78C4EC] bg-white border border-[#78C4EC]/40 hover:bg-[#EBF6FC] px-3.5 py-1.5 rounded-full transition shadow-sm"
                >
                  ✕ 清除所有篩選條件
                </button>
              )}
            </div>

            {/* 若無符合搜尋結果 */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 max-w-lg mx-auto space-y-4">
                <div className="text-4xl">🔍</div>
                <h4 className="font-bold text-stone-700">找不到符合條件的商品</h4>
                <p className="text-xs text-stone-500">
                  沒有找到關鍵字「{searchKeyword}」相關商品。您也可以直接透過 LINE 傳送想代購的日本商品照片或連結，專人為您即時查價報價！
                </p>
                <a
                  href={lineOfficialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow transition"
                >
                  💬 傳 LINE 由專人查價許願
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => openProductDetail(product)}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/90 hover:border-[#78C4EC] flex flex-col group cursor-pointer relative"
                  >
                    {/* 商品圖片與狀態標籤 */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      <img
                        src={product.images[0] || "https://images.unsplash.com/photo-1540340061722-9293d5163008?w=600&q=80"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />

                      {/* 左上分類膠囊 */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                        <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-[10px] font-bold text-stone-700 shadow-sm">
                          {product.categoryName}
                        </span>
                      </div>

                      {/* 右上供貨與取貨標籤 */}
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-10">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                            product.status === "in_stock"
                              ? "bg-emerald-500 text-white"
                              : "bg-sky-500 text-white"
                          }`}
                        >
                          {product.status === "in_stock" ? "🟢 台灣現貨" : "✈️ 連線預購"}
                        </span>
                        {product.allowSendaiPickup && (
                          <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur text-[9px] font-bold text-amber-700 shadow-sm border border-amber-200">
                            🏪 可仙台店取
                          </span>
                        )}
                        {product.allowEmsDirect && (
                          <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur text-[9px] font-bold text-blue-700 shadow-sm border border-blue-200">
                            📦 支援 EMS 直寄
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 商品資訊與價格區塊 */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-bold text-stone-800 text-base leading-snug group-hover:text-[#78C4EC] transition">
                          {product.name}
                        </h4>
                        <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        {/* 價格標示 */}
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-semibold text-stone-400">一口價</span>
                            <span className="text-2xl font-black text-[#78C4EC] tracking-tight">
                              NT$ {product.price.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-400 leading-tight mt-0.5">
                            台幣一口價（含代購費；國內外運費及關稅另計）
                          </p>
                        </div>

                        {/* 規格標籤預覽 */}
                        {product.specs && product.specs.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {product.specs.slice(0, 2).map((sp, idx) => (
                              <span key={idx} className="text-[10px] font-medium bg-slate-50 text-stone-600 px-2 py-0.5 rounded-md border border-slate-200">
                                {sp}
                              </span>
                            ))}
                            {product.specs.length > 2 && (
                              <span className="text-[10px] text-stone-400 self-center">
                                +{product.specs.length - 2} 款
                              </span>
                            )}
                          </div>
                        )}

                        {/* 查看規格按鈕 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openProductDetail(product);
                          }}
                          className="w-full py-2.5 px-4 bg-[#78C4EC] hover:bg-[#6db3e0] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                        >
                          <span>查看規格詳情・選購 ↗</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* =========================================================================
          【任務四：商品詳情規格視窗 (Product Detail Modal) ＋ 雙軌海關物流說明】
      ========================================================================= */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#6db3e0] relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#78C4EC] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  {selectedProduct.categoryName}
                </span>
                <h3 className="text-lg sm:text-xl font-bold mt-1.5 leading-snug">
                  {selectedProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition text-lg font-bold"
                aria-label="關閉"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-stone-700">
              {/* 加入購物車成功反饋通知 */}
              {cartSuccessFeedback && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 animate-in fade-in">
                  <span>✅</span>
                  <span>{cartSuccessFeedback}</span>
                </div>
              )}

              {/* 大圖預覽與主要狀態 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-inner relative">
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold shadow ${
                        selectedProduct.status === "in_stock"
                          ? "bg-emerald-500 text-white"
                          : "bg-sky-500 text-white"
                      }`}
                    >
                      {selectedProduct.status === "in_stock" ? "🟢 台灣現貨" : "✈️ 日本連線預購"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* 一口價醒目呈現 */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-stone-400 block">台幣一口價</span>
                    <div className="text-3xl font-black text-[#78C4EC] tracking-tight mt-0.5">
                      NT$ {selectedProduct.price.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-stone-500 font-medium leading-relaxed mt-1">
                      ✓ {selectedProduct.priceNote}
                    </p>
                  </div>

                  {/* 物流支援標籤 */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedProduct.allowSendaiPickup && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-1">
                        🏪 支援仙台店面取貨（免台灣運費/報關）
                      </span>
                    )}
                    {selectedProduct.allowEmsDirect && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold flex items-center gap-1">
                        📦 支援日本郵便 EMS 直寄台灣
                      </span>
                    )}
                  </div>

                  {/* 說明文字 */}
                  <p className="text-xs text-stone-600 leading-relaxed font-medium">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>

              {/* 互動式規格選擇器 (Specs Selector) */}
              {selectedProduct.specs && selectedProduct.specs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-stone-700 block">
                    選擇商品規格／款式：
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.specs.map((spec) => (
                      <button
                        key={spec}
                        onClick={() => setSelectedSpec(spec)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                          selectedSpec === spec
                            ? "bg-[#78C4EC] text-white shadow-md ring-2 ring-[#78C4EC]/30"
                            : "bg-slate-100 text-stone-700 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 購買數量增減器 (Quantity Stepper 1~10) */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-stone-700">購買數量：</span>
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                    disabled={orderQuantity <= 1}
                    className="w-9 h-9 flex items-center justify-center font-bold text-stone-600 hover:bg-slate-100 disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-stone-800">
                    {orderQuantity}
                  </span>
                  <button
                    onClick={() => setOrderQuantity(Math.min(10, orderQuantity + 1))}
                    disabled={orderQuantity >= 10}
                    className="w-9 h-9 flex items-center justify-center font-bold text-stone-600 hover:bg-slate-100 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 【💡 費用與彈性物流／國際通關須知小卡】 */}
              <div className="bg-[#FAFDFE] rounded-2xl p-4 sm:p-5 border border-[#78C4EC]/40 space-y-3 text-xs leading-relaxed">
                <div className="font-bold text-[#78C4EC] text-sm flex items-center gap-1.5">
                  <span>💡</span>
                  <span>費用與彈性物流／國際通關須知</span>
                </div>
                <div className="space-y-2 text-stone-600">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <strong className="text-stone-800 block mb-0.5">
                      1. 日常合箱集運（7-11／全家／台灣宅配）：
                    </strong>
                    由日本仙台合箱集運回台後分寄，僅需負擔台灣國內運費（滿額免運）；若遇海關專案抽驗產生稅費則依稅單比例實報實銷。
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <strong className="text-stone-800 block mb-0.5">
                      2. 高單價球具／急件（日本郵便 EMS 國際直寄）：
                    </strong>
                    可選由日本郵局直接寄達台灣收件地址，國際託運單設定由「收件方（買家）」負擔海關稅費（請配合 EZ WAY 易利委申報並於郵差派件時憑稅單繳納）。
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <strong className="text-stone-800 block mb-0.5">
                      3. 日本仙台店面親自取貨：
                    </strong>
                    預約於仙台店面親取者，免台灣國內運費且無跨境包裹報關稅費，歡迎赴日旅遊順道自取。
                  </div>
                </div>
              </div>

              {/* 雙行動按鈕 */}

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    addToCart(selectedProduct, selectedSpec, orderQuantity);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-3 px-4 bg-white border-2 border-[#78C4EC] text-[#78C4EC] hover:bg-[#E5F3FC] text-xs sm:text-sm font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  <span>加入購物車</span>
                </button>
                <button
                  onClick={() => {
                    addToCart(selectedProduct, selectedSpec, orderQuantity);
                    setSelectedProduct(null);
                    setIsCartOpen(true);
                  }}
                  className="flex-1 py-3 px-4 bg-[#78C4EC] hover:bg-[#6db3e0] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>⚡ 立即結帳</span>
                </button>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-stone-500">
              <span>台幣一口價已含服務費・安心代購保證</span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-lg transition"
              >
                關閉視窗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 入口 B：右下角常駐懸浮「＋加 LINE 好友」提示按鈕 */}
      <a
        href={lineOfficialUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="加 LINE 好友諮詢"
        className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 transition transform hover:scale-105 group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-200"></span>
        </span>
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 5.82 2 10.53c0 2.92 1.74 5.5 4.39 6.96-.19.7-.69 2.54-.79 2.93-.12.48.17.47.36.35.15-.1 2.06-1.4 2.89-1.97.74.1 1.49.16 2.25.16 5.52 0 10-3.82 10-8.53S17.52 2 12 2z"/>
        </svg>
        <span className="text-sm tracking-wide">＋加 LINE 好友諮詢</span>
      </a>

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
              專營日本最新棒壘運動裝備、機能文具、益智教具、家庭保健與在地文創生活雜貨。<br/>
              日本仙台現地直購，安全安心。
            </p>
          </div>

          <div id="contact">
            <div className="font-bold text-[#78C4EC] text-sm mb-4 tracking-wider">聯絡與諮詢</div>
            <div className="space-y-3 text-sm text-stone-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                LINE 官方帳號：歡迎直接點擊加好友
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#78C4EC]"></span>
                客服時間：10:00 - 20:00 (JST)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                物流支援：台灣合箱宅配・日本 EMS 直寄・仙台店面自取
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold text-[#78C4EC] text-sm mb-4 tracking-wider">快速導覽</div>
            <ul className="space-y-2 text-sm text-stone-600 font-medium">
              <li><a href="#search-section" className="hover:text-[#78C4EC] transition">全站尋物搜尋</a></li>
              <li><a href="#categories" className="hover:text-[#78C4EC] transition">五大核心分類</a></li>
              <li><a href="#products-grid" className="hover:text-[#78C4EC] transition">商品櫥窗</a></li>
              <li><a href="#video" className="hover:text-[#78C4EC] transition">現場實拍影片</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-[#C8A878]/20 pt-6 text-center text-[11px] text-stone-500 font-medium tracking-wide">
          <p>Copyright © 2026 YUKI & TOMOYA JAPAN SELECT. All rights reserved.</p>
        </div>
      </footer>

      {/* 6. 底部固定四格導覽列 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-[56px] bg-[#bbe3f8] hover:bg-[#a8d0f0] border-t border-[#C8A878]/30 flex items-stretch shadow-[0_-4px_10px_rgba(0,0,0,0.03)] pb-safe md:hidden">
        <a
          href={lineOfficialUrl}
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
          href="#search-section"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#6d6d6d] hover:bg-[#78C4EC]/10 transition relative after:content-[''] after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-[1px] after:bg-white"
        >
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#78C4EC]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2B857]"></span>
          </div>
          <span className="text-[10px] font-bold tracking-wide mt-0.5">尋物搜尋</span>
        </a>
        <a
          href="#categories"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#6d6d6d] hover:bg-[#78C4EC]/10 transition relative after:content-[''] after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-[1px] after:bg-white"
        >
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#78C4EC]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F29B9B]"></span>
          </div>
          <span className="text-[10px] font-bold tracking-wide mt-0.5">核心分類</span>
        </a>
        <button
          onClick={() => setContactOpen(!contactOpen)}
          aria-label="展開"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#6d6d6d] hover:bg-[#78C4EC]/10 transition"
        >
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2B857]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#78C4EC]"></span>
          </div>
          <span className="text-[10px] font-bold tracking-wide mt-0.5">客服諮詢</span>
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
            <a href={lineOfficialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#EBF6FC] text-stone-700 font-medium transition">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
              <span>LINE 官方客服</span>
            </a>
            <a href="#search-section" onClick={() => setContactOpen(false)} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#EBF6FC] text-stone-700 font-medium transition">
              <span className="w-2.5 h-2.5 rounded-full bg-[#78C4EC] shadow-sm" />
              <span>全站商品搜尋</span>
            </a>
          </div>
        </div>
      )}

      {/* 許願單區塊 */}
      <section className="px-6 md:px-10 pb-20 pt-10 bg-white">
        <WishFormSection lineOfficialUrl={lineOfficialUrl} />
      </section>

      {/* Cart Checkout Modal */}
      <CartCheckoutModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateCartQuantity}
        removeItem={removeCartItem}
        lineOfficialUrl={lineOfficialUrl}
        clearCart={() => setCartItems([])}
      />

      {/* 底部導覽列 (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-40 px-6 py-3 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <a href={lineOfficialUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#06C755] flex flex-col items-center gap-1 transition-colors">
          <MessageCircle size={24} className="text-[#06C755]" />
          <span className="text-[10px] font-bold text-[#06C755]">客服</span>
        </a>
        <button onClick={() => setIsCartOpen(true)} className="relative bg-[#78C4EC] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-[#78C4EC]/30 flex items-center gap-2 transition-transform active:scale-95">
          <ShoppingCart size={20} />
          購物車結帳
          {cartItems.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-extrabold border-2 border-white shadow-sm">
              {cartItems.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
