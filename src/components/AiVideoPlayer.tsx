"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Lucide 圖示
import {
  Download,
  Film,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface AiScript {
  enabled?: boolean;
  cover?: {
    issue: string;
    title: string;
    subtitle: string;
    stamp: string;
    speakerName: string;
    speakerTitle: string;
  };
  qaCard?: {
    start: number;
    end: number;
    author: string;
    question: string;
  };
  numberedPills?: Array<{
    number: number;
    text: string;
    side: "left" | "right";
    start: number;
    end: number;
  }>;
  bigKeywords?: Array<{
    text: string;
    badge: string;
    start: number;
    end: number;
  }>;
  checklistCard?: {
    title: string;
    items: string[];
    start: number;
    end: number;
  };
  subtitles?: Array<{
    start: number;
    end: number;
    text: string;
    highlight: string;
  }>;
}

export default function AiVideoPlayer({
  videoUrl,
  aiScript,
  poster,
}: {
  videoUrl: string;
  aiScript: AiScript | null;
  poster?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isVertical, setIsVertical] = useState(false);

  // Local toggle for effect without changing redis
  const [effectEnabled, setEffectEnabled] = useState(aiScript?.enabled !== false);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  useEffect(() => {
    setEffectEnabled(aiScript?.enabled !== false);
  }, [aiScript?.enabled]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const target = e.currentTarget;
    setIsVertical(target.videoHeight > target.videoWidth);
  };

  const activeEffects = {
    cover: aiScript?.cover && currentTime >= 0 && currentTime <= 2.5,
    qa: aiScript?.qaCard && currentTime >= aiScript.qaCard.start && currentTime <= aiScript.qaCard.end,
    numberedPills: aiScript?.numberedPills?.filter((p) => currentTime >= p.start && currentTime <= p.end) || [],
    bigKeyword: aiScript?.bigKeywords?.find((k) => currentTime >= k.start && currentTime <= k.end),
    checklist: aiScript?.checklistCard && currentTime >= aiScript.checklistCard.start && currentTime <= aiScript.checklistCard.end,
    subtitle: aiScript?.subtitles?.find((s) => currentTime >= s.start && currentTime <= s.end),
  };

  const isZoomed = effectEnabled && (activeEffects.checklist || activeEffects.bigKeyword);

  const videoClass = `w-full h-full object-cover transition-transform duration-700 ease-in-out ${
    isZoomed ? "scale-105" : "scale-100"
  }`;

  const containerClass = isVertical
    ? "max-w-[360px] w-full mx-auto aspect-[9/16] relative bg-black rounded-2xl shadow-xl overflow-hidden border-4 border-white ring-1 ring-[#bbe3f8]/40"
    : "w-full max-w-4xl mx-auto aspect-video relative bg-black rounded-2xl shadow-xl overflow-hidden border-4 border-white ring-1 ring-[#bbe3f8]/40";

  const renderSubtitleText = (text: string, highlight: string) => {
    if (!highlight) return text;
    const parts = text.split(highlight);
    return (
      <>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="text-[#78C4EC] text-lg sm:text-xl font-extrabold mx-1">{highlight}</span>
            )}
          </span>
        ))}
      </>
    );
  };

  // ================= 匯出影片功能 =================
  const exportVideo = useCallback(async () => {
    if (!videoRef.current || !containerRef.current) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
        // Stop current playback
        videoRef.current.pause();
        const duration = videoRef.current.duration;
        videoRef.current.currentTime = 0;

        // 確保有 duration
        if (!duration || !isFinite(duration)) {
            throw new Error("Cannot determine video duration");
        }

        // Setup Canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get 2d context");

        const vw = videoRef.current.videoWidth;
        const vh = videoRef.current.videoHeight;

        // Set canvas to video intrinsic size
        canvas.width = vw;
        canvas.height = vh;

        // 建立離線錄製器
        const stream = canvas.captureStream(30); // 30 fps
        const options = { mimeType: 'video/webm;codecs=vp8,opus' };

        // Ensure MediaRecorder is supported
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
             console.warn(`${options.mimeType} is not supported, using default.`);
             delete (options as any).mimeType;
        }

        const mediaRecorder = new MediaRecorder(stream, options);
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };

        const recordingPromise = new Promise<Blob>((resolve) => {
            mediaRecorder.onstop = () => {
                resolve(new Blob(chunks, { type: chunks[0] instanceof Blob ? chunks[0].type : 'video/webm' }));
            };
        });

        mediaRecorder.start();

        // Simulate playback loop for rendering
        const fps = 30;
        const step = 1 / fps;
        const totalFrames = Math.ceil(duration * fps);

        // Prepare styles for canvas drawing based on current container size
        const containerRect = containerRef.current.getBoundingClientRect();
        const scaleX = vw / containerRect.width;
        const scaleY = vh / containerRect.height;

        // Wait for video to seek
        await new Promise((r) => {
             const onSeeked = () => {
                 videoRef.current?.removeEventListener('seeked', onSeeked);
                 r(true);
             };
             videoRef.current?.addEventListener('seeked', onSeeked);
             // Ensure it triggers if it's already at 0
             if(videoRef.current?.currentTime === 0) r(true);
        });

        // Render loop
        for (let frame = 0; frame <= totalFrames; frame++) {
            const time = frame * step;
            if (time > duration) break;

            videoRef.current.currentTime = time;

            await new Promise((r) => {
                const onSeeked = () => {
                    videoRef.current?.removeEventListener('seeked', onSeeked);
                    r(true);
                };
                videoRef.current?.addEventListener('seeked', onSeeked);
            });

            setExportProgress(Math.floor((frame / totalFrames) * 100));

            // Draw video frame
            ctx.clearRect(0, 0, vw, vh);

            // Handle Zoom if enabled
            if (effectEnabled && aiScript) {
                 const cTime = videoRef.current.currentTime;
                 const activeChecklist = aiScript.checklistCard && cTime >= aiScript.checklistCard.start && cTime <= aiScript.checklistCard.end;
                 const activeBigK = aiScript.bigKeywords?.find((k) => cTime >= k.start && cTime <= k.end);
                 const isZoom = activeChecklist || activeBigK;

                 if (isZoom) {
                     ctx.save();
                     ctx.translate(vw / 2, vh / 2);
                     ctx.scale(1.05, 1.05);
                     ctx.translate(-vw / 2, -vh / 2);
                     ctx.drawImage(videoRef.current, 0, 0, vw, vh);
                     ctx.restore();
                 } else {
                     ctx.drawImage(videoRef.current, 0, 0, vw, vh);
                 }
            } else {
                ctx.drawImage(videoRef.current, 0, 0, vw, vh);
            }

            // ==========================================
            // Draw UI Overlays (Simplified Canvas Render)
            // ==========================================
            if (effectEnabled && aiScript) {
                const cTime = time;

                // --- 常駐標籤 ---
                ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
                ctx.beginPath();
                ctx.roundRect(20 * scaleX, 20 * scaleY, 140 * scaleX, 28 * scaleY, 14 * Math.min(scaleX, scaleY));
                ctx.fill();
                ctx.fillStyle = "#6d6d6d";
                ctx.font = `bold ${12 * scaleY}px sans-serif`;
                ctx.fillText("✨ ユキ&トモヤ｜日本實拍", 28 * scaleX, 39 * scaleY);

                // --- 封面 ---
                if (aiScript.cover && cTime <= 2.5) {
                    ctx.fillStyle = "rgba(120, 196, 236, 0.9)";
                    ctx.fillRect(0, 0, vw, 40 * scaleY);

                    ctx.fillStyle = "#ffffff";
                    ctx.font = `bold ${14 * scaleY}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.fillText(`ユキ&トモヤ｜${aiScript.cover.issue}`, vw / 2, 25 * scaleY);

                    ctx.fillStyle = "#ffffff";
                    ctx.font = `bold ${36 * scaleY}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.shadowColor = "rgba(0,0,0,0.5)";
                    ctx.shadowBlur = 10;
                    ctx.fillText(aiScript.cover.title, vw / 2, vh / 2 - 40 * scaleY);
                    ctx.shadowBlur = 0;

                    ctx.font = `normal ${18 * scaleY}px sans-serif`;
                    ctx.fillText(aiScript.cover.subtitle, vw / 2, vh / 2);
                }

                // --- QA Card ---
                if (aiScript.qaCard && cTime >= aiScript.qaCard.start && cTime <= aiScript.qaCard.end) {
                    ctx.fillStyle = "white";
                    const cx = vw / 2;
                    const cy = vh / 2;
                    ctx.shadowColor = "rgba(0,0,0,0.1)";
                    ctx.shadowBlur = 20 * scaleY;
                    ctx.beginPath();
                    ctx.roundRect(cx - 150 * scaleX, cy - 60 * scaleY, 300 * scaleX, 120 * scaleY, 16 * Math.min(scaleX, scaleY));
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    ctx.fillStyle = "#78C4EC";
                    ctx.font = `bold ${14 * scaleY}px sans-serif`;
                    ctx.textAlign = "left";
                    ctx.fillText(`● ${aiScript.qaCard.author}`, cx - 130 * scaleX, cy - 30 * scaleY);

                    ctx.fillStyle = "#333";
                    ctx.font = `bold ${18 * scaleY}px sans-serif`;
                    ctx.fillText(aiScript.qaCard.question, cx - 130 * scaleX, cy + 10 * scaleY);
                }

                // --- Subtitles ---
                const sub = aiScript.subtitles?.find((s) => cTime >= s.start && cTime <= s.end);
                if (sub) {
                    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
                    const padX = 20 * scaleX;
                    const padY = 10 * scaleY;
                    ctx.font = `bold ${16 * scaleY}px sans-serif`;
                    const m = ctx.measureText(sub.text);
                    const rectW = m.width + padX * 2;
                    const rectH = 16 * scaleY + padY * 2;

                    const rx = (vw - rectW) / 2;
                    const ry = vh - rectH - 40 * scaleY;

                    ctx.beginPath();
                    ctx.roundRect(rx, ry, rectW, rectH, rectH / 2);
                    ctx.fill();

                    ctx.fillStyle = "#ffffff";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    // Simplification: Not rendering highlight color in canvas export to save complex math
                    ctx.fillText(sub.text, vw / 2, ry + rectH / 2);
                }
            }

            // Slight delay to allow canvas render
            await new Promise((r) => setTimeout(r, 10));
        }

        mediaRecorder.stop();
        const blob = await recordingPromise;

        // Download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `exported_video_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);

    } catch (err) {
        console.error("Export error:", err);
        alert("影片匯出失敗");
    } finally {
        setIsExporting(false);
        setExportProgress(0);
        // resume normal playback
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
        }
    }
  }, [aiScript, effectEnabled]);


  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* 播放器容器 */}
      <div className={containerClass} ref={containerRef}>
        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster || undefined}
          autoPlay
          loop
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          className={videoClass}
        />

        {/* AI 特效圖層 */}
        {effectEnabled && aiScript && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden font-sans">

            {/* 常駐左上角標籤 */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-white/85 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/50">
              <span className="text-[10px] sm:text-xs font-bold text-[#6d6d6d]">✨ ユキ&トモヤ｜日本實拍</span>
            </div>

            {/* 1. 雜誌風封面 (0:00 ~ 0:02.5) */}
            {activeEffects.cover && (
              <div className="absolute inset-0 z-20 flex flex-col bg-gradient-to-b from-black/30 via-transparent to-black/40 animate-in fade-in duration-500">
                <div className="w-full bg-[#78C4EC]/95 text-white text-center py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold tracking-widest uppercase">
                  {aiScript.cover?.issue}
                </div>

                <div className="flex-1 flex flex-col items-center justify-start pt-12 sm:pt-20 px-6">
                  <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold text-center leading-tight drop-shadow-lg scale-in-center tracking-wide">
                    {aiScript.cover?.title}
                  </h1>
                  {aiScript.cover?.subtitle && (
                    <p className="mt-3 text-white/90 text-sm sm:text-base font-medium tracking-widest drop-shadow-md">
                      {aiScript.cover.subtitle}
                    </p>
                  )}
                </div>

                {/* 裝飾印章 */}
                {aiScript.cover?.stamp && (
                  <div className="absolute top-24 left-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#78C4EC] bg-[#78C4EC]/10 backdrop-blur flex items-center justify-center rotate-[-15deg]">
                     <span className="text-[#78C4EC] font-bold text-[10px] sm:text-xs text-center leading-tight">
                        {aiScript.cover.stamp.split("").join("\n")}
                     </span>
                  </div>
                )}

                {/* 右側條碼裝飾 (僅非直式或有空間時顯示) */}
                <div className="absolute top-24 right-6 flex-col items-end opacity-70 hidden sm:flex">
                  <div className="flex gap-1 h-12">
                    {[...Array(12)].map((_, i) => (
                       <div key={i} className={`w-0.5 sm:w-1 bg-white ${i % 3 === 0 ? 'h-full' : 'h-3/4'}`} />
                    ))}
                  </div>
                  <span className="text-white text-[8px] mt-1 tracking-widest">YUKI & TOMOYA</span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div className="bg-white/20 backdrop-blur-md border border-white/40 rounded-xl px-4 py-2">
                    <p className="text-white/80 text-[10px] sm:text-xs mb-0.5">{aiScript.cover?.speakerTitle}</p>
                    <p className="text-white font-bold text-sm sm:text-base">｜{aiScript.cover?.speakerName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Q&A 卡片 */}
            {activeEffects.qa && (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in zoom-in duration-300">
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/50 w-full max-w-sm mx-auto flex flex-col gap-4 transform -translate-y-8">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#78C4EC]" />
                    <span className="text-[#78C4EC] font-bold text-xs sm:text-sm tracking-wider uppercase">
                      {aiScript.qaCard?.author}
                    </span>
                  </div>
                  <h2 className="text-[#333] text-lg sm:text-xl font-extrabold leading-relaxed">
                    {aiScript.qaCard?.question}
                  </h2>
                </div>
              </div>
            )}

            {/* 3. 編號重點膠囊 */}
            {activeEffects.numberedPills.map((pill, idx) => (
              <div
                key={`pill-${idx}`}
                className={`absolute z-20 top-[${30 + idx * 15}%] sm:top-[${25 + idx * 15}%] ${
                  pill.side === "left" ? "left-4 slide-in-from-left" : "right-4 slide-in-from-right"
                } flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full pr-4 pl-1.5 py-1.5 shadow-lg border border-[#bbe3f8]/50 animate-in fade-in duration-500`}
                style={{ top: `${25 + idx * 15}%` }}
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#78C4EC] flex items-center justify-center text-white font-extrabold text-sm sm:text-base">
                  {pill.number}
                </div>
                <span className="text-[#555] font-bold text-xs sm:text-sm">{pill.text}</span>
              </div>
            ))}

            {/* 4. 背景視覺大字 */}
            {activeEffects.bigKeyword && (
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none mix-blend-overlay">
                <h2 className="text-white text-7xl sm:text-8xl md:text-9xl font-black uppercase tracking-tighter opacity-80 scale-in-center rotate-[-5deg]">
                  {activeEffects.bigKeyword.text}
                </h2>
              </div>
            )}
            {activeEffects.bigKeyword?.badge && (
               <div className="absolute top-20 right-6 z-20 bg-yellow-400 text-black font-black px-3 py-1 text-sm sm:text-base rounded-md rotate-12 shadow-lg animate-bounce">
                  {activeEffects.bigKeyword.badge}
               </div>
            )}

            {/* 5. 推薦清單勾選卡 */}
            {activeEffects.checklist && (
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 pb-24 sm:pb-32 bg-gradient-to-t from-black/60 to-transparent">
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-white/60 w-full max-w-sm slide-in-bottom">
                  <h3 className="text-[#6db3e0] font-extrabold text-sm sm:text-base mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#78C4EC]" />
                    {aiScript.checklistCard?.title}
                  </h3>
                  <ul className="space-y-2">
                    {aiScript.checklistCard?.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-[#444] font-bold text-xs sm:text-sm">
                        <div className="w-4 h-4 rounded bg-[#78C4EC]/20 flex items-center justify-center">
                           <div className="w-2 h-2 rounded-sm bg-[#78C4EC]" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 6. 動態底部字幕 */}
            {activeEffects.subtitle && !activeEffects.cover && (
              <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center px-4">
                <div className="bg-slate-900/80 backdrop-blur-md rounded-full px-5 py-2.5 sm:px-6 sm:py-3 shadow-lg border border-white/10 text-center max-w-xs sm:max-w-md animate-in slide-in-from-bottom-2 fade-in duration-200">
                  <p className="text-white text-sm sm:text-base font-bold tracking-wide">
                    {renderSubtitleText(activeEffects.subtitle.text, activeEffects.subtitle.highlight)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Exporting Overlay */}
        {isExporting && (
            <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-6 backdrop-blur-sm">
                 <div className="w-12 h-12 border-4 border-[#78C4EC] border-t-transparent rounded-full animate-spin mb-4" />
                 <p className="text-white font-bold text-lg mb-2">正在匯出影片...</p>
                 <div className="w-full max-w-xs bg-white/20 rounded-full h-3 overflow-hidden">
                     <div className="bg-[#78C4EC] h-full transition-all duration-200" style={{ width: `${exportProgress}%` }} />
                 </div>
                 <p className="text-white/60 text-sm mt-2">{exportProgress}%</p>
            </div>
        )}
      </div>

      {/* 控制列 */}
      <div className="flex flex-wrap items-center justify-center gap-3 bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-2xl shadow-sm border border-[#bbe3f8] mt-2 w-full max-w-sm sm:max-w-md">
        <button
          onClick={() => setEffectEnabled(!effectEnabled)}
          disabled={!aiScript || isExporting}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
            !aiScript ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400" :
            effectEnabled
              ? "bg-[#78C4EC] text-white shadow-md hover:bg-[#6db3e0]"
              : "bg-gray-100 text-[#6d6d6d] hover:bg-gray-200"
          }`}
        >
          {effectEnabled ? <Sparkles className="w-4 h-4" /> : <Film className="w-4 h-4" />}
          {effectEnabled ? "✨ AI 特效開啟" : "🎬 原始影片"}
        </button>

        <button
          onClick={exportVideo}
          disabled={!aiScript || !effectEnabled || isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-white text-[#78C4EC] border border-[#78C4EC] hover:bg-[#F2FAFD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          匯出影片
        </button>
      </div>

      {/* 隱藏樣式，用於動態類別產生 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scale-in-center {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .scale-in-center { animation: scale-in-center 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }

        @keyframes slide-in-bottom {
          0% { transform: translateY(50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .slide-in-bottom { animation: slide-in-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
      `}} />
    </div>
  );
}