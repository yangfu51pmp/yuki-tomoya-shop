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
  speechSegments?: Array<{
    start: number;
    end: number;
    zoomLevel: 1 | 1.07;
  }>;
  subtitles?: Array<{
    start: number;
    end: number;
    text: string;
    highlight: string;
    color?: string;
  }>;
  events?: Array<{
    id: string;
    type: string;
    start: number;
    end: number;
    side?: "left" | "right" | "center";
    title: string;
    subtitle?: string;
    items?: string[];
    number?: number;
    icon?: string;
    badge?: string;
    strikeThrough?: boolean;
    zoom?: boolean;
    sfx?: "pop" | "whoosh" | "ding" | "alert";
    author?: string; // For qa_bubble backward compat
    question?: string; // For qa_bubble backward compat
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cutEnabled, setCutEnabled] = useState(false);
  const [currentSpeechZoom, setCurrentSpeechZoom] = useState<number>(1);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [exportedFile, setExportedFile] = useState<File | null>(null);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  const playedSfxRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEffectEnabled(aiScript?.enabled !== false);
  }, [aiScript?.enabled]);

  const audioContextRef = useRef<AudioContext | null>(null);

  const playSfx = useCallback((type: 'pop' | 'whoosh' | 'ding' | 'alert') => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
        if (!AudioContext) return;
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;

      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, t);
        osc.frequency.exponentialRampToValueAtTime(850, t + 0.05);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
        osc.start(t);
        osc.stop(t + 0.1);
      } else if (type === 'ding') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987, t);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1318, t);
        gain2.gain.setValueAtTime(0.3, t);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc.start(t);
        osc2.start(t);
        osc.stop(t + 0.3);
        osc2.stop(t + 0.3);
      } else if (type === 'whoosh') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.18);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.18);
        osc.start(t);
        osc.stop(t + 0.2);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.1);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(220, t + 0.12);
        gain2.gain.setValueAtTime(0, t);
        gain2.gain.setValueAtTime(0.3, t + 0.12);
        gain2.gain.linearRampToValueAtTime(0.01, t + 0.22);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc.start(t);
        osc2.start(t + 0.12);
        osc.stop(t + 0.11);
        osc2.stop(t + 0.23);
      }
    } catch (e) {
      console.log('Web Audio API not supported or interaction required', e);
    }
  }, [soundEnabled]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cTime = videoRef.current.currentTime;
      setCurrentTime(cTime);

      // Reset sounds if video loops or restarts
      if (cTime < 0.5) {
        playedSfxRef.current.clear();
      }

      // AI Gap Cutting & Auto Zoom
      if (cutEnabled && aiScript?.speechSegments && aiScript.speechSegments.length > 0) {
        const segments = aiScript.speechSegments;
        let inSegment = false;
        for (let i = 0; i < segments.length; i++) {
          const seg = segments[i];
          if (cTime >= seg.start && cTime <= seg.end) {
            inSegment = true;
            setCurrentSpeechZoom(seg.zoomLevel);
            break;
          }
        }

        if (!inSegment) {
          const nextSeg = segments.find(s => s.start > cTime);
          if (nextSeg) {
            videoRef.current.currentTime = nextSeg.start;
          }
        }
      } else {
        setCurrentSpeechZoom(1);
      }

      if (effectEnabled && aiScript) {
        const events = allEvents.filter(e => cTime >= e.start && cTime <= e.end);
        events.forEach(evt => {
          if (evt.sfx && !playedSfxRef.current.has(evt.id)) {
            playedSfxRef.current.add(evt.id);
            playSfx(evt.sfx as 'pop' | 'whoosh' | 'ding' | 'alert');
          }
        });
      }
    }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const target = e.currentTarget;
    setIsVertical(target.videoHeight > target.videoWidth);
  };

  // Backward compatibility: Convert old elements to new events
  const allEvents = (aiScript?.events || []).slice();
  if (aiScript && allEvents.length === 0) {
     if (aiScript.qaCard) {
         allEvents.push({ id: 'legacy_qa', type: 'qa_bubble', start: aiScript.qaCard.start, end: aiScript.qaCard.end, author: aiScript.qaCard.author, title: aiScript.qaCard.question, sfx: 'pop' });
     }
     if (aiScript.numberedPills) {
         aiScript.numberedPills.forEach((p, i) => allEvents.push({ id: `legacy_pill_${i}`, type: 'numbered_pill', start: p.start, end: p.end, number: p.number, title: p.text, side: p.side, sfx: 'pop' }));
     }
     if (aiScript.bigKeywords) {
         aiScript.bigKeywords.forEach((k, i) => allEvents.push({ id: `legacy_keyword_${i}`, type: 'big_impact', start: k.start, end: k.end, title: k.text, badge: k.badge, zoom: true, sfx: 'whoosh' }));
     }
     if (aiScript.checklistCard) {
         allEvents.push({ id: 'legacy_checklist', type: 'checklist_card', start: aiScript.checklistCard.start, end: aiScript.checklistCard.end, title: aiScript.checklistCard.title, items: aiScript.checklistCard.items, sfx: 'ding' });
     }
  }

  const activeEffects = {
    cover: aiScript?.cover && currentTime >= 0 && currentTime <= 2.5,
    subtitle: aiScript?.subtitles?.find((s) => currentTime >= s.start && currentTime <= s.end),
    events: allEvents.filter((e) => currentTime >= e.start && currentTime <= e.end),
  };

  const hasZoomEvent = activeEffects.events.some(e => e.zoom === true || e.type === 'big_impact');
  const isZoomed = effectEnabled && hasZoomEvent;

  let scaleClass = "scale-100";
  if (isZoomed) scaleClass = "scale-[1.08]";
  else if (cutEnabled && currentSpeechZoom === 1.07) scaleClass = "scale-[1.07]";

  const videoClass = `w-full h-full object-cover transition-transform duration-500 ease-out ${
    scaleClass
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
        canvas.width = Math.floor(vw / 2) * 2;
        canvas.height = Math.floor(vh / 2) * 2;

        // 建立離線錄製器
        const stream = canvas.captureStream(30); // 30 fps
        let options: MediaRecorderOptions = { mimeType: 'video/mp4;codecs=avc1' };
        if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
            options = { mimeType: 'video/mp4' };
            if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
                options = { mimeType: 'video/webm;codecs=vp8,opus' };
            }
        }

        // Ensure MediaRecorder is supported
        if (!options.mimeType || !MediaRecorder.isTypeSupported(options.mimeType)) {
             console.warn(`${options.mimeType} is not supported, using default.`);
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                resolve(new Blob(chunks, { type: options.mimeType || 'video/mp4' }));
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
        const file = new File([blob], 'yuki-tomoya-video.mp4', { type: 'video/mp4' });
        const objUrl = URL.createObjectURL(file);
        setExportedFile(file);
        setExportedUrl(objUrl);

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
    <div className={`flex flex-col items-center gap-4 w-full ${isFullscreen ? 'fixed inset-0 z-[99999] bg-black/95 justify-center h-[100dvh]' : ''}`}>
      {/* 全螢幕頂部列 */}
      {isFullscreen && (
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <button onClick={() => setIsRotated(!isRotated)} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold text-sm backdrop-blur transition">
            🔄 橫向滿版
          </button>
          <button onClick={() => { setIsFullscreen(false); setIsRotated(false); }} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold text-sm backdrop-blur transition">
            ✕ 關閉全螢幕
          </button>
        </div>
      )}

      {/* 播放器容器 */}
      <div className={`${containerClass} ${isFullscreen && isRotated ? 'rotate-90 w-[100dvh] h-[100vw] origin-center' : ''}`} ref={containerRef}>
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

            {/* 動態事件渲染 (9 種 EventType) */}
            {activeEffects.events.map((evt, idx) => {
              const baseAnim = "animate-in fade-in zoom-in-95 duration-200";
              const positionProps = evt.side === "left" ? { left: "1rem" } : evt.side === "right" ? { right: "1rem" } : { left: "1rem", right: "1rem", margin: "0 auto" };

              switch (evt.type) {
                case 'qa_bubble':
                  return (
                    <div key={evt.id} className={`absolute z-20 top-[20%] flex w-full justify-center px-4 ${baseAnim}`}>
                      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-5 sm:p-6 shadow-2xl border border-white/50 max-w-sm w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#78C4EC]" />
                          <span className="text-[#78C4EC] font-bold text-xs tracking-wider">{evt.author || "Q&A"}</span>
                        </div>
                        <h2 className="text-[#333] text-lg font-extrabold leading-tight">{evt.title || evt.question}</h2>
                      </div>
                    </div>
                  );
                case 'myth_buster':
                  return (
                    <div key={evt.id} className={`absolute inset-0 z-20 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm ${baseAnim}`}>
                      <div className="bg-white/95 rounded-2xl p-6 shadow-2xl max-w-xs text-center border-4 border-red-500 relative">
                        <div className="absolute -top-8 -left-8 text-6xl drop-shadow-md text-red-500 rotate-[-15deg]">🚫</div>
                        <h2 className="text-[#333] text-xl font-black mt-2">{evt.title}</h2>
                      </div>
                    </div>
                  );
                case 'numbered_pill':
                  return (
                    <div key={evt.id} className={`absolute z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full pr-4 pl-1.5 py-1.5 shadow-lg border border-[#bbe3f8]/50 ${baseAnim}`} style={{ top: `${25 + idx * 12}%`, ...positionProps }}>
                      <div className="w-7 h-7 rounded-full bg-[#78C4EC] flex items-center justify-center text-white font-extrabold text-sm">{evt.number}</div>
                      <span className="text-[#555] font-bold text-sm">{evt.title}</span>
                    </div>
                  );
                case 'icon_pill':
                  return (
                    <div key={evt.id} className={`absolute z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full pr-4 pl-2 py-1.5 shadow-lg border border-gray-200 ${baseAnim}`} style={{ top: `${10 + idx * 10}%`, ...positionProps }}>
                      <span className="text-lg">{evt.icon}</span>
                      <span className="text-[#333] font-bold text-sm">{evt.title}</span>
                    </div>
                  );
                case 'big_impact':
                  return (
                    <div key={evt.id} className={`absolute inset-0 z-10 flex items-center justify-center pointer-events-none mix-blend-overlay ${baseAnim}`}>
                      <h2 className={`text-white text-5xl sm:text-7xl font-black uppercase tracking-wider drop-shadow-lg scale-in-center rotate-[-5deg] ${evt.strikeThrough ? 'line-through decoration-red-500 decoration-8' : ''}`}>
                        {evt.title}
                      </h2>
                      {evt.badge && (
                        <div className="absolute top-[30%] left-[20%] z-20 bg-red-600 text-white font-black px-4 py-2 text-xl rounded-md rotate-[-20deg] shadow-2xl border-2 border-white animate-bounce">
                          {evt.badge}
                        </div>
                      )}
                    </div>
                  );
                case 'warning_tape':
                  return (
                    <div key={evt.id} className={`absolute z-20 top-[40%] left-0 w-full flex items-center justify-center py-3 shadow-2xl border-y-4 border-black ${baseAnim}`} style={{ backgroundImage: 'repeating-linear-gradient(45deg, #facc15, #facc15 12px, #1e293b 12px, #1e293b 24px)' }}>
                      <div className="bg-black/80 px-6 py-1 rounded border border-yellow-400 flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        <span className="text-red-500 font-black text-xl tracking-widest">{evt.title}</span>
                      </div>
                    </div>
                  );
                case 'target_focus':
                  return (
                    <div key={evt.id} className={`absolute z-20 flex items-center justify-center ${baseAnim}`} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                       <div className="relative flex items-center justify-center">
                          <div className="absolute w-24 h-24 border-2 border-dashed border-red-500 rounded-full animate-[spin_4s_linear_infinite]" />
                          <div className="absolute w-32 h-32 border border-[#78C4EC] rounded-full animate-ping opacity-50" />
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                       </div>
                       <div className="absolute top-16 bg-white/90 px-3 py-1 rounded text-[#333] font-bold text-sm shadow-md whitespace-nowrap">
                         {evt.title}
                       </div>
                    </div>
                  );
                case 'progress_card':
                  return (
                    <div key={evt.id} className={`absolute z-20 bottom-24 left-0 right-0 mx-auto max-w-xs w-[90%] bg-white/90 backdrop-blur rounded-xl p-4 shadow-xl ${baseAnim}`}>
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-white bg-[#78C4EC] px-2 py-0.5 rounded">{evt.badge || 'FEATURE'}</span>
                          <span className="text-lg">{evt.icon}</span>
                       </div>
                       <h3 className="text-[#333] font-extrabold text-sm mb-2">{evt.title}</h3>
                       <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-[#78C4EC] h-2 rounded-full w-[80%] animate-[pulse_2s_ease-in-out_infinite]" />
                       </div>
                    </div>
                  );
                case 'checklist_card':
                  return (
                    <div key={evt.id} className={`absolute z-20 inset-0 flex flex-col justify-end p-6 pb-28 bg-gradient-to-t from-black/60 to-transparent ${baseAnim}`}>
                      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-white/60 w-full max-w-sm mx-auto">
                        <h3 className="text-[#6db3e0] font-extrabold text-sm sm:text-base mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#78C4EC]" />
                          {evt.title}
                        </h3>
                        <ul className="space-y-2">
                          {(evt.items || []).map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-[#444] font-bold text-sm">
                              <div className="w-4 h-4 rounded bg-[#78C4EC]/20 flex items-center justify-center">
                                 <div className="w-2 h-2 rounded-sm bg-[#78C4EC]" />
                              </div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                default:
                  return null;
              }
            })}

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

        {/* Floating Fullscreen button */}
        {!isFullscreen && (
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-3 right-3 z-40 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur transition shadow-lg flex items-center justify-center"
            title="全螢幕放大"
          >
            ⛶ 放大
          </button>
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
          onClick={() => setSoundEnabled(!soundEnabled)}
          disabled={!aiScript || isExporting || !effectEnabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
            !effectEnabled ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400" :
            soundEnabled
              ? "bg-[#bbe3f8] text-[#333] shadow-sm hover:bg-[#a9d9f2]"
              : "bg-gray-100 text-[#6d6d6d] hover:bg-gray-200"
          }`}
        >
          {soundEnabled ? "🔊 特效音：開" : "🔇 特效音：關"}
        </button>

        <button
          onClick={() => setCutEnabled(!cutEnabled)}
          disabled={!aiScript || isExporting}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
            !aiScript ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400" :
            cutEnabled
              ? "bg-[#78C4EC] text-white shadow-md hover:bg-[#6db3e0]"
              : "bg-gray-100 text-[#6d6d6d] hover:bg-gray-200"
          }`}
        >
          {cutEnabled ? "✂️ 氣口剪輯：開" : "✂️ 氣口剪輯：關"}
        </button>

        <button
          onClick={() => setIsFullscreen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors bg-gray-100 text-[#6d6d6d] hover:bg-gray-200"
        >
          ⛶ 全螢幕放大
        </button>

        <button
          onClick={exportVideo}
          disabled={!aiScript || !effectEnabled || isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-white text-[#78C4EC] border border-[#78C4EC] hover:bg-[#F2FAFD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
        >
          <Download className="w-4 h-4" />
          🎬 匯出 MP4 影片 (v2.0)
        </button>
      </div>

      {/* 匯出結果區塊 */}
      {exportedUrl && exportedFile && (
        <div className="w-full max-w-sm sm:max-w-md bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-sm mt-2 flex flex-col gap-3">
          <div className="text-emerald-700 font-bold text-sm flex items-center gap-2">
            ✅ 影片已匯出成功！
          </div>
          <video src={exportedUrl} controls playsInline className="w-full rounded-lg shadow-sm border border-emerald-100" />

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Yuki & Tomoya Video',
                  files: [exportedFile]
                }).catch(console.error);
              } else {
                alert('您的裝置不支援快速分享功能，請長按影片或點擊下方按鈕下載');
              }
            }}
            className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            📲 儲存到 iPhone 相簿 / 傳送至 LINE
          </button>

          <div className="flex flex-col gap-2 mt-1">
            <a href={exportedUrl} download="yuki-tomoya-video.mp4" className="text-center text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-100/50 py-2 rounded-lg transition">
              ⬇ 下載 MP4 檔案
            </a>
            <a href={videoUrl} download="original-video.mp4" className="text-center text-xs font-bold text-stone-500 hover:text-stone-600 bg-stone-100/50 py-2 rounded-lg transition">
              ⬇ 下載原始 MP4 影片
            </a>
          </div>
        </div>
      )}

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