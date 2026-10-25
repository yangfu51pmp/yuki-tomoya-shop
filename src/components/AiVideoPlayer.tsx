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
  outro?: {
    badge: string;
    title: string;
    points: string[];
    credit: string;
    cta: string;
  };
}


const FULL_71S_SCRIPT = {
  cover: { issue: "ISSUE 07｜日本仙台・草野塾實戰特訓", title: "揮棒軌跡怎麼練？", subtitle: "前日職樂天金鷲・草野大輔教練 親授打擊核心", stamp: "名師親授", speakerName: "草野大輔 教練", speakerTitle: "日本仙台草野塾 總教練" },
  outro: { badge: "⚾ 仙台草野塾 × ユキ&トモヤ｜特訓總結", title: "少棒打擊 3 大核心重點", points: ["1️⃣ 立棒預備：消除倒棒習慣，最短距離切入球心", "2️⃣ 軸心穩定：重心留住不前衝，手肘貼近身體導引", "3️⃣ 完整延伸：正面咬中擊球點，手腕順勢延伸釋放力量"], credit: "指導：草野大輔 教練｜選手：智也 (Tomoya)", cta: "💬 ユキ&トモヤ 日本連線代購 & 台日少棒交流｜歡迎 LINE 諮詢" },
  subtitles: [
    { start: 0.0, end: 3.5, text: "【仙台草野塾】今天由草野教練親授正確的揮棒軌跡！", highlight: "正確的揮棒軌跡", color: "sky" },
    { start: 3.5, end: 7.0, text: "草野教練：「很多球員準備揮棒時，球棒會這樣往後倒平…」", highlight: "往後倒平", color: "coral" },
    { start: 7.0, end: 10.5, text: "草野教練：「這樣不對！球棒要先立起來，手部留在軸心內側」", highlight: "球棒要先立起來", color: "sky" },
    { start: 10.5, end: 14.0, text: "草野教練：「出棒不要用雙手硬拉，手肘順著身體前導推出」", highlight: "手肘順著身體", color: "amber" },
    { start: 14.0, end: 17.5, text: "草野教練：「看這個角度！從耳際最短距離直接切入擊球區」", highlight: "最短距離", color: "sky" },
    { start: 17.5, end: 21.0, text: "草野教練：「球棒通過本壘上方時，擊球平面要穩定不晃動」", highlight: "擊球平面要穩定", color: "amber" },
    { start: 21.0, end: 25.0, text: "草野教練：「眼睛盯住前面這顆白球，預判球進本壘的高度」", highlight: "盯住前面這顆白球", color: "sky" },
    { start: 25.0, end: 28.8, text: "草野教練：「慢動作分解：①立棒預備 ➔ ②雙手貼近身體導引」", highlight: "①立棒預備", color: "amber" },
    { start: 28.8, end: 32.8, text: "草野教練：「接著 ③在擊球點正面咬中球心，棒頭絕不能掉下來」", highlight: "正面咬中球心", color: "coral" },
    { start: 32.8, end: 36.8, text: "草野教練：「再看一次軌跡：順著延伸線，平平地穿過球心！」", highlight: "平平地穿過球心", color: "sky" },
    { start: 36.8, end: 41.2, text: "草野教練：「擊中球後手腕自然帶過，把全身旋轉力量釋放出來」", highlight: "力量釋放出來", color: "amber" },
    { start: 41.2, end: 45.2, text: "草野教練：「注意喔！上半身千萬別急著往前衝，重心要留住」", highlight: "重心要留住", color: "coral" },
    { start: 45.2, end: 49.0, text: "草野教練：「用下半身帶動腰部旋轉，雙手自然把球棒順暢帶出」", highlight: "下半身帶動腰部", color: "sky" },
    { start: 49.0, end: 53.0, text: "草野教練：「好，換智也實作看看！先把球棒架好對準前方」", highlight: "換智也實作看看", color: "amber" },
    { start: 53.0, end: 57.2, text: "草野教練：「對！雙手放在耳朵旁邊這個高度，雙肩保持放鬆」", highlight: "耳朵旁邊這個高度", color: "sky" },
    { start: 57.2, end: 61.0, text: "草野教練：「很好！下盤站穩保持平衡，眼神鎖定前方擊球點」", highlight: "眼神鎖定前方", color: "amber" },
    { start: 61.0, end: 64.5, text: "草野教練：「先在腦中確認一次剛才的揮棒軌道，動作流暢就好」", highlight: "確認一次", color: "sky" },
    { start: 64.5, end: 67.5, text: "草野教練：「漂亮！就是這個出棒角度，棒頭維持得非常好！」", highlight: "就是這個出棒角度", color: "amber" },
    { start: 67.5, end: 72.0, text: "【今日特訓總結】記住這個擊球手感！仙台草野塾 × ユキ&トモヤ", highlight: "仙台草野塾", color: "sky" }
  ],
  events: [
    { id: "e1", type: "qa_bubble", start: 3.5, end: 7.0, side: "left", author: "草野塾・打擊Q&A", title: "為什麼揮棒容易切球或打成滾地球？", sfx: "pop" },
    { id: "e2", type: "myth_buster", start: 5.0, end: 9.0, side: "right", title: "NG：球棒往後倒平", subtitle: "導致出棒繞遠路、棒頭下掉", badge: "錯誤姿勢", sfx: "alert" },
    { id: "e3", type: "big_impact", start: 9.0, end: 13.5, side: "center", title: "手臂硬拉", badge: "不是", strikeThrough: true, zoom: true, sfx: "whoosh" },
    { id: "e4", type: "target_focus", start: 13.5, end: 17.5, side: "left", title: "手腕立棒角度", subtitle: "最短距離切入本壘擊球區", sfx: "ding" },
    { id: "e5", type: "icon_pill", start: 17.5, end: 21.0, side: "right", icon: "⚾", title: "擊球平面穩定不晃動", sfx: "pop" },
    { id: "e6", type: "target_focus", start: 21.0, end: 25.0, side: "left", title: "視線鎖定：定點白球", subtitle: "預判進壘高度與擊球空間", sfx: "ding" },
    { id: "e7", type: "numbered_pill", number: 1, start: 25.0, end: 36.8, side: "left", title: "立棒預備（不倒棒）", sfx: "pop" },
    { id: "e8", type: "numbered_pill", number: 2, start: 27.5, end: 36.8, side: "right", title: "手肘貼近軸心導引", sfx: "pop" },
    { id: "e9", type: "numbered_pill", number: 3, start: 30.0, end: 36.8, side: "left", title: "擊球點正面咬中球心", sfx: "pop" },
    { id: "e10", type: "numbered_pill", number: 4, start: 33.0, end: 36.8, side: "right", title: "順著延伸線平穿而出", sfx: "pop" },
    { id: "e11", type: "progress_card", start: 36.8, end: 41.2, side: "left", badge: "POWER", title: "手腕跟進與力量釋放", icon: "⚡", sfx: "pop" },
    { id: "e12", type: "warning_tape", start: 41.2, end: 47.0, side: "center", title: "切勿身體前衝", subtitle: "重心留後軸腳・下半身帶動旋轉", zoom: true, sfx: "alert" },
    { id: "e13", type: "qa_bubble", start: 49.0, end: 54.0, side: "left", author: "實戰演練・智也登場", title: "架高球棒、雙手置於耳際高度預備", sfx: "pop" },
    { id: "e14", type: "checklist_card", start: 54.0, end: 64.5, side: "left", title: "揮棒前 Check List", items: ["雙手置於耳際高度放鬆", "下盤站穩重心留軸心腳", "雙眼鎖定前方擊球點"], sfx: "ding" },
    { id: "e15", type: "big_impact", start: 64.5, end: 67.2, side: "center", title: "完美軌跡", badge: "GOOD!", strikeThrough: false, zoom: true, sfx: "ding" }
  ]
};

export default function AiVideoPlayer({
  videoUrl,
  aiScript,
  poster,
  isPreviewProp,
}: {
  videoUrl: string;
  aiScript: AiScript | null;
  poster?: string;
  isPreviewProp?: boolean;
}) {

  const isPreviewMode = Boolean(isPreviewProp || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === 'video'));

  let resolvedScript = aiScript;
  if (!aiScript || !aiScript.subtitles || aiScript.subtitles.length < 15 || !aiScript.outro) {
    resolvedScript = FULL_71S_SCRIPT as any;
  }

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isVertical, setIsVertical] = useState(false);

  // Local toggle for effect without changing redis
  const [effectEnabled, setEffectEnabled] = useState(resolvedScript?.enabled !== false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [jumpCutEnabled, setJumpCutEnabled] = useState(false);
  const [currentSpeechZoom, setCurrentSpeechZoom] = useState<number>(1);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [exportedFile, setExportedFile] = useState<File | null>(null);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  const playedSfxRef = useRef<Set<string>>(new Set());
  const lastUpdateRef = useRef<number>(0);
  const lastSeekRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const unlockAudio = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      setIsVideoMuted(false);
    }
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current && AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      if (ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0;
        osc.connect(gain);
        gain.connect(exportDestRef.current || ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.001);
      }
    } catch (e) {
      console.log('Audio unlock failed', e);
    }
  }, []);


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEffectEnabled(resolvedScript?.enabled !== false);
  }, [resolvedScript?.enabled]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const exportDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

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
      gain.connect(exportDestRef.current || ctx.destination);

      if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, t);
        osc.frequency.exponentialRampToValueAtTime(850, t + 0.05);
        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
        osc.start(t);
        osc.stop(t + 0.1);
      } else if (type === 'ding') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987, t);
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1318, t);
        gain2.gain.setValueAtTime(0.6, t);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc2.connect(gain2);
        gain2.connect(exportDestRef.current || ctx.destination);

        osc.start(t);
        osc2.start(t);
        osc.stop(t + 0.3);
        osc2.stop(t + 0.3);
      } else if (type === 'whoosh') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.18);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.18);
        osc.start(t);
        osc.stop(t + 0.2);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.1);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(220, t + 0.12);
        gain2.gain.setValueAtTime(0, t);
        gain2.gain.setValueAtTime(0.6, t + 0.12);
        gain2.gain.linearRampToValueAtTime(0.01, t + 0.22);
        osc2.connect(gain2);
        gain2.connect(exportDestRef.current || ctx.destination);

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
      const now = Date.now();

      if (now - lastUpdateRef.current > 120) {
        setCurrentTime(cTime);
        lastUpdateRef.current = now;
      }

      // Reset sounds if video loops or restarts
      if (cTime < 0.5) {
        playedSfxRef.current.clear();
      }

      // AI Gap Cutting & Auto Zoom
      if (jumpCutEnabled && resolvedScript?.speechSegments && resolvedScript.speechSegments.length > 0) {
        const segments = resolvedScript.speechSegments;
        let inSegment = false;
        for (let i = 0; i < segments.length; i++) {
          const seg = segments[i];
          if (cTime >= seg.start && cTime <= seg.end) {
            inSegment = true;
            setCurrentSpeechZoom(seg.zoomLevel);
            break;
          }
        }

        if (!inSegment && now - lastSeekRef.current > 800) {
          const nextSeg = segments.find(s => s.start > cTime);
          if (nextSeg) {
            videoRef.current.currentTime = nextSeg.start;
            lastSeekRef.current = now;
          }
        }
      } else {
        setCurrentSpeechZoom(1);
      }

      if (effectEnabled && resolvedScript) {
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
  const allEvents = (resolvedScript?.events || []).slice();
  if (resolvedScript && allEvents.length === 0) {
     if (resolvedScript.qaCard) {
         allEvents.push({ id: 'legacy_qa', type: 'qa_bubble', start: resolvedScript.qaCard.start, end: resolvedScript.qaCard.end, author: resolvedScript.qaCard.author, title: resolvedScript.qaCard.question, sfx: 'pop' });
     }
     if (resolvedScript.numberedPills) {
         resolvedScript.numberedPills.forEach((p, i) => allEvents.push({ id: `legacy_pill_${i}`, type: 'numbered_pill', start: p.start, end: p.end, number: p.number, title: p.text, side: p.side, sfx: 'pop' }));
     }
     if (resolvedScript.bigKeywords) {
         resolvedScript.bigKeywords.forEach((k, i) => allEvents.push({ id: `legacy_keyword_${i}`, type: 'big_impact', start: k.start, end: k.end, title: k.text, badge: k.badge, zoom: true, sfx: 'whoosh' }));
     }
     if (resolvedScript.checklistCard) {
         allEvents.push({ id: 'legacy_checklist', type: 'checklist_card', start: resolvedScript.checklistCard.start, end: resolvedScript.checklistCard.end, title: resolvedScript.checklistCard.title, items: resolvedScript.checklistCard.items, sfx: 'ding' });
     }
  }

  const activeEffects = {
    cover: resolvedScript?.cover && currentTime >= 0 && currentTime <= 3.5,
    subtitle: resolvedScript?.subtitles?.find((s) => currentTime >= s.start && currentTime <= s.end),
    events: allEvents.filter((e) => currentTime >= e.start && currentTime <= e.end),
    outro: resolvedScript?.outro && videoRef.current?.duration && videoRef.current.duration > 10 && currentTime >= videoRef.current.duration - 3.8,
  };

  const hasZoomEvent = activeEffects.events.some(e => e.zoom === true || e.type === 'big_impact');
  const isZoomed = effectEnabled && hasZoomEvent;

  let scaleClass = "scale-100";
  if (isZoomed) scaleClass = "scale-[1.08]";
  else if (jumpCutEnabled && currentSpeechZoom === 1.07) scaleClass = "scale-[1.07]";

  const videoClass = `w-full h-full object-cover transition-transform duration-500 ease-out ${
    scaleClass
  }`;

  const containerClass = isVertical
    ? "max-w-[360px] w-full mx-auto aspect-[9/16] relative bg-black rounded-2xl shadow-xl overflow-hidden border-4 border-white ring-1 ring-[#bbe3f8]/40"
    : "w-full max-w-4xl mx-auto aspect-video relative bg-black rounded-2xl shadow-xl overflow-hidden border-4 border-white ring-1 ring-[#bbe3f8]/40";


  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };
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

  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  };

  const exportVideo = useCallback(async () => {
    if (!videoRef.current || !containerRef.current) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
        const v = videoRef.current;
        v.pause();
        const duration = v.duration;

        if (!duration || !isFinite(duration)) {
            throw new Error("Cannot determine video duration");
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get 2d context");

        const vw = v.videoWidth;
        const vh = v.videoHeight;
        canvas.width = Math.floor(vw / 2) * 2;
        canvas.height = Math.floor(vh / 2) * 2;

        const canvasStream = canvas.captureStream(30);

        const chunks: BlobPart[] = [];
        let mediaRecorder: MediaRecorder;
        const selectedMime = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';

        try {
            mediaRecorder = selectedMime
                ? new MediaRecorder(canvasStream, { mimeType: selectedMime })
                : new MediaRecorder(canvasStream);
            mediaRecorder.start(200);
        } catch (err1) {
            mediaRecorder = new MediaRecorder(canvasStream);
            mediaRecorder.start(200);
        }

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        const recordingPromise = new Promise<Blob>((resolve) => {
            mediaRecorder.onstop = () => resolve(new Blob(chunks, { type: mediaRecorder.mimeType || 'video/mp4' }));
        });

        // Fast forward export wait for 0
        v.currentTime = 0;
        await new Promise<void>((r) => {
            const onSeeked = () => { v.removeEventListener('seeked', onSeeked); r(); };
            v.addEventListener('seeked', onSeeked);
            if (v.currentTime === 0) r();
        });
        await new Promise(r => setTimeout(r, 150));

        v.muted = true;
        await v.play();

        const containerRect = containerRef.current.getBoundingClientRect();
        const scaleX = vw / containerRect.width;
        const scaleY = vh / containerRect.height;

        let animationFrameId: number | undefined;
        const drawFrame = async () => {
            if (v.ended || v.currentTime >= duration - 0.15) {
                mediaRecorder.stop();
                return;
            }

            setExportProgress(Math.floor((v.currentTime / duration) * 100));
            ctx.clearRect(0, 0, vw, vh);

            try {
                // Handle Zoom
                let isZoom = false;
                if (effectEnabled && resolvedScript) {
                    const cTime = v.currentTime;
                    const activeChecklist = resolvedScript.checklistCard && cTime >= resolvedScript.checklistCard.start && cTime <= resolvedScript.checklistCard.end;
                    const activeBigK = resolvedScript.bigKeywords?.find((k) => cTime >= k.start && cTime <= k.end);
                    isZoom = !!(activeChecklist || activeBigK);
                }

                if (isZoom) {
                    ctx.save();
                    ctx.translate(vw / 2, vh / 2);
                    ctx.scale(1.05, 1.05);
                    ctx.translate(-vw / 2, -vh / 2);
                    ctx.drawImage(v, 0, 0, vw, vh);
                    ctx.restore();
                } else {
                    ctx.drawImage(v, 0, 0, vw, vh);
                }

                if (effectEnabled && resolvedScript) {
                    const cTime = v.currentTime;

                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    const cx = vw / 2;
                    const cy = vh / 2;

                    // --- 常駐標籤 ---
                    if (!(resolvedScript.cover && cTime <= 3.5)) {
                        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
                        drawRoundedRect(ctx, 20 * scaleX, 20 * scaleY, 170 * scaleX, 28 * scaleY, 14 * Math.min(scaleX, scaleY));
                        ctx.fillStyle = "#6d6d6d";
                        ctx.font = `bold ${12 * scaleY}px sans-serif`;
                        ctx.fillText("✨ ユキ&トモヤ｜日本實拍", 28 * scaleX, 34 * scaleY);
                    }

                    // --- 封面 ---
                    if (resolvedScript.cover && cTime <= 3.5) {
                        ctx.fillStyle = "rgba(120, 196, 236, 0.9)";
                        ctx.fillRect(0, 0, vw, 40 * scaleY);

                        ctx.fillStyle = "#ffffff";
                        ctx.font = `bold ${14 * scaleY}px sans-serif`;
                        ctx.textAlign = "center";
                        ctx.fillText(`ユキ&トモヤ｜${resolvedScript.cover.issue}`, cx, 20 * scaleY);

                        ctx.fillStyle = "#ffffff";
                        ctx.font = `bold ${36 * scaleY}px sans-serif`;
                        ctx.textAlign = "center";
                        ctx.shadowColor = "rgba(0,0,0,0.5)";
                        ctx.shadowBlur = 10;
                        ctx.fillText(resolvedScript.cover.title, cx, cy - 40 * scaleY);
                        ctx.shadowBlur = 0;

                        if (resolvedScript.cover.subtitle) {
                            ctx.font = `bold ${16 * scaleY}px sans-serif`;
                            ctx.fillText(resolvedScript.cover.subtitle, cx, cy + 10 * scaleY);
                        }
                    }

                    // --- Active Events ---
                    const activeEvts = allEvents.filter(e => cTime >= e.start && cTime <= e.end);
                    for (const evt of activeEvts) {
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'middle';

                        const eW = 320 * scaleX;
                        const eH = 100 * scaleY;
                        let eX = cx - eW/2;
                        let eY = cy - eH/2;

                        if (evt.side === 'left') { eX = 20 * scaleX; }
                        else if (evt.side === 'right') { eX = vw - eW - 20 * scaleX; }

                        if (evt.type === 'qa_bubble') {
                            eY = vh * 0.2;
                            ctx.fillStyle = "white";
                            ctx.shadowColor = "rgba(0,0,0,0.2)";
                            ctx.shadowBlur = 20 * scaleY;
                            drawRoundedRect(ctx, eX, eY, eW, eH, 16 * Math.min(scaleX, scaleY));
                            ctx.shadowBlur = 0;

                            ctx.fillStyle = "#78C4EC";
                            ctx.font = `bold ${14 * scaleY}px sans-serif`;
                            ctx.fillText(`● ${evt.author || 'Q&A'}`, eX + 20 * scaleX, eY + 30 * scaleY);

                            ctx.fillStyle = "#333";
                            ctx.font = `bold ${18 * scaleY}px sans-serif`;
                            ctx.fillText(evt.title || evt.question || '', eX + 20 * scaleX, eY + 65 * scaleY);
                        } else if (evt.type === 'myth_buster') {
                            eY = cy - eH/2;
                            ctx.fillStyle = "white";
                            ctx.strokeStyle = "red";
                            ctx.lineWidth = 4 * scaleY;
                            drawRoundedRect(ctx, eX, eY, eW, eH, 16 * Math.min(scaleX, scaleY));
                            ctx.stroke();

                            ctx.fillStyle = "#333";
                            ctx.font = `900 ${22 * scaleY}px sans-serif`;
                            ctx.textAlign = "center";
                            ctx.fillText(evt.title, eX + eW/2, eY + 40 * scaleY);

                            if (evt.subtitle) {
                                ctx.font = `bold ${14 * scaleY}px sans-serif`;
                                ctx.fillText(evt.subtitle, eX + eW/2, eY + 70 * scaleY);
                            }
                        } else if (evt.type === 'big_impact') {
                            ctx.fillStyle = "white";
                            ctx.font = `900 ${60 * scaleY}px sans-serif`;
                            ctx.textAlign = "center";
                            ctx.shadowColor = "rgba(0,0,0,0.8)";
                            ctx.shadowBlur = 10;
                            ctx.fillText(evt.title, cx, cy);
                            ctx.shadowBlur = 0;

                            if (evt.strikeThrough) {
                                const m = ctx.measureText(evt.title);
                                ctx.strokeStyle = "red";
                                ctx.lineWidth = 8 * scaleY;
                                ctx.beginPath();
                                ctx.moveTo(cx - m.width/2, cy);
                                ctx.lineTo(cx + m.width/2, cy);
                                ctx.stroke();
                            }
                        } else if (evt.type === 'target_focus') {
                            ctx.fillStyle = "rgba(255,255,255,0.9)";
                            drawRoundedRect(ctx, cx - 100 * scaleX, cy + 60 * scaleY, 200 * scaleX, 30 * scaleY, 4 * scaleY);
                            ctx.fillStyle = "#333";
                            ctx.font = `bold ${14 * scaleY}px sans-serif`;
                            ctx.textAlign = "center";
                            ctx.fillText(evt.title, cx, cy + 75 * scaleY);
                        } else if (evt.type === 'numbered_pill') {
                            const pW = 200 * scaleX;
                            const pH = 40 * scaleY;
                            const pY = 0.25 * vh + (allEvents.indexOf(evt) % 4) * 50 * scaleY;
                            let pX = evt.side === 'left' ? 20 * scaleX : vw - pW - 20 * scaleX;

                            ctx.fillStyle = "rgba(255,255,255,0.95)";
                            drawRoundedRect(ctx, pX, pY, pW, pH, 20 * scaleY);

                            ctx.fillStyle = "#78C4EC";
                            ctx.beginPath();
                            ctx.arc(pX + 20 * scaleX, pY + 20 * scaleY, 14 * scaleY, 0, Math.PI * 2);
                            ctx.fill();

                            ctx.fillStyle = "white";
                            ctx.font = `bold ${14 * scaleY}px sans-serif`;
                            ctx.textAlign = "center";
                            ctx.fillText(String(evt.number || 1), pX + 20 * scaleX, pY + 21 * scaleY);

                            ctx.fillStyle = "#333";
                            ctx.textAlign = "left";
                            ctx.fillText(evt.title, pX + 45 * scaleX, pY + 21 * scaleY);
                        } else if (evt.type === 'icon_pill') {
                            const pW = 220 * scaleX;
                            const pH = 40 * scaleY;
                            const pY = 0.1 * vh + (allEvents.indexOf(evt) % 4) * 50 * scaleY;
                            let pX = evt.side === 'left' ? 20 * scaleX : vw - pW - 20 * scaleX;

                            ctx.fillStyle = "rgba(255,255,255,0.95)";
                            drawRoundedRect(ctx, pX, pY, pW, pH, 20 * scaleY);

                            ctx.fillStyle = "#333";
                            ctx.font = `bold ${14 * scaleY}px sans-serif`;
                            ctx.textAlign = "left";
                            ctx.fillText(`${evt.icon || ''} ${evt.title}`, pX + 20 * scaleX, pY + 21 * scaleY);
                        } else if (evt.type === 'warning_tape') {
                            ctx.fillStyle = "rgba(0,0,0,0.8)";
                            ctx.fillRect(0, vh * 0.4, vw, 60 * scaleY);
                            ctx.fillStyle = "#facc15";
                            ctx.fillRect(0, vh * 0.4, vw, 4 * scaleY);
                            ctx.fillRect(0, vh * 0.4 + 56 * scaleY, vw, 4 * scaleY);

                            ctx.fillStyle = "red";
                            ctx.font = `900 ${20 * scaleY}px sans-serif`;
                            ctx.textAlign = "center";
                            ctx.fillText(`⚠️ ${evt.title}`, cx, vh * 0.4 + 30 * scaleY);
                        } else if (evt.type === 'progress_card') {
                            const pW = 300 * scaleX;
                            const pH = 80 * scaleY;
                            const pY = vh - pH - 100 * scaleY;

                            ctx.fillStyle = "rgba(255,255,255,0.9)";
                            drawRoundedRect(ctx, cx - pW/2, pY, pW, pH, 12 * scaleY);

                            ctx.fillStyle = "#333";
                            ctx.font = `800 ${16 * scaleY}px sans-serif`;
                            ctx.textAlign = "left";
                            ctx.fillText(evt.title, cx - pW/2 + 20 * scaleX, pY + 30 * scaleY);
                        } else if (evt.type === 'checklist_card') {
                            const cW = 320 * scaleX;
                            const cH = 160 * scaleY;
                            const cY = vh - cH - 40 * scaleY;

                            ctx.fillStyle = "rgba(255,255,255,0.95)";
                            drawRoundedRect(ctx, cx - cW/2, cY, cW, cH, 16 * scaleY);

                            ctx.fillStyle = "#78C4EC";
                            ctx.font = `800 ${16 * scaleY}px sans-serif`;
                            ctx.textAlign = "left";
                            ctx.fillText(`✓ ${evt.title}`, cx - cW/2 + 20 * scaleX, cY + 30 * scaleY);

                            ctx.fillStyle = "#444";
                            ctx.font = `bold ${14 * scaleY}px sans-serif`;
                            (evt.items || []).forEach((item, i) => {
                                ctx.fillText(`■ ${item}`, cx - cW/2 + 20 * scaleX, cY + 70 * scaleY + i * 25 * scaleY);
                            });
                        }
                    }

                    // --- Outro ---
                    const isOutro = resolvedScript.outro && duration > 10 && cTime >= duration - 3.8;
                    if (isOutro && resolvedScript.outro) {
                        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                        ctx.fillRect(0, 0, vw, vh);

                        const oW = 340 * scaleX;
                        const oH = 340 * scaleY;
                        ctx.fillStyle = "white";
                        drawRoundedRect(ctx, cx - oW/2, cy - oH/2, oW, oH, 24 * scaleY);

                        ctx.fillStyle = "#333";
                        ctx.font = `900 ${24 * scaleY}px sans-serif`;
                        ctx.textAlign = "center";
                        ctx.fillText(resolvedScript.outro.title, cx, cy - oH/2 + 60 * scaleY);

                        ctx.font = `bold ${14 * scaleY}px sans-serif`;
                        ctx.textAlign = "left";
                        (resolvedScript.outro.points || []).forEach((pt, i) => {
                            ctx.fillText(pt, cx - oW/2 + 20 * scaleX, cy - oH/2 + 120 * scaleY + i * 35 * scaleY);
                        });
                    }

                    // --- Subtitles ---
                    const sub = resolvedScript.subtitles?.find((s) => cTime >= s.start && cTime <= s.end);
                    if (sub && !isOutro && !(resolvedScript.cover && cTime <= 3.5)) {
                        ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
                        const padX = 20 * scaleX;
                        const padY = 10 * scaleY;
                        ctx.font = `bold ${16 * scaleY}px sans-serif`;
                        const m = ctx.measureText(sub.text);
                        const rectW = m.width + padX * 2;
                        const rectH = 16 * scaleY + padY * 2;

                        const rx = (vw - rectW) / 2;
                        const ry = vh - rectH - 40 * scaleY;

                        drawRoundedRect(ctx, rx, ry, rectW, rectH, rectH / 2);

                        ctx.fillStyle = "#ffffff";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(sub.text, vw / 2, ry + rectH / 2);
                    }
                }
            } catch (err) {
                console.error("Canvas draw error during export:", err);
            }

            animationFrameId = requestAnimationFrame(drawFrame);
        };
        drawFrame();

        const blob = await recordingPromise;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

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
        if (videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(()=>{});
        }
    }
  }, [resolvedScript, effectEnabled]);


  return (
    <div className={`flex flex-col items-center gap-4 w-full ${isFullscreen ? 'fixed inset-0 z-[99999] bg-black/95 justify-center h-[100dvh]' : ''}`}>
      {/* 全螢幕頂部列 */}
      {isFullscreen && (
        <>
          <button onClick={() => setIsRotated(!isRotated)} className="absolute bottom-4 right-4 z-50 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold text-sm backdrop-blur transition">
            🔄 橫向滿版
          </button>
          <button onClick={() => { setIsFullscreen(false); setIsRotated(false); }} className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold text-sm backdrop-blur transition">
            ✕ 關閉全螢幕
          </button>
        </>
      )}

      {/* 播放器容器 */}
      <div onClick={unlockAudio} className={`${containerClass} ${isFullscreen && isRotated ? 'rotate-90 w-[100dvh] h-[100vw] origin-center' : ''}`} ref={containerRef}>
        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster || undefined}
          autoPlay
          loop
          playsInline
          controls={false}
          controlsList={!isPreviewMode ? "nodownload" : undefined}
          onContextMenu={!isPreviewMode ? (e) => e.preventDefault() : undefined}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={handleLoadedMetadata}
          className={videoClass}
        />

        {/* Playback Overlays */}
        {!isPlaying && !isExporting && (
          <div className="absolute inset-0 z-40 pointer-events-auto flex items-center justify-center bg-black/40"
               onClick={() => {
                 const v = videoRef.current;
                 if (v) {
                   v.muted = false;
                   v.volume = 1.0;
                   if (v.paused) {
                     v.play().catch(() => { v.muted = true; v.play(); });
                   } else {
                     v.pause();
                   }
                 }
               }}
          >
            <div className="bg-[#78C4EC] text-white px-6 py-3 rounded-full font-extrabold shadow-2xl flex items-center gap-2 hover:bg-[#6db3e0] transition transform hover:scale-105 cursor-pointer text-lg">
              ▶ 點擊播放影片（含聲音＋AI特效）
            </div>
          </div>
        )}

        {/* Bottom Playback Bar */}
        {!isExporting && (
          <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-auto bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between transition-opacity duration-300 opacity-0 hover:opacity-100">
             <button
                onClick={(e) => {
                  e.stopPropagation();
                  const v = videoRef.current;
                  if (v) {
                    if (v.paused) v.play().catch(() => { v.muted = true; v.play(); });
                    else v.pause();
                  }
                }}
                className="text-white hover:text-[#78C4EC] transition"
             >
                {isPlaying ? '⏸ 暫停' : '▶ 播放'}
             </button>
             <div className="text-white/90 text-sm font-bold tracking-wider">
                {formatTime(currentTime)} / {videoRef.current?.duration ? formatTime(videoRef.current.duration) : '0:00'}
             </div>
             <button
                onClick={(e) => {
                  e.stopPropagation();
                  const v = videoRef.current;
                  if (v) {
                    v.muted = !v.muted;
                    setIsVideoMuted(v.muted);
                  }
                }}
                className="text-white hover:text-[#78C4EC] transition"
             >
                {isVideoMuted ? '🔇 靜音' : '🔊 聲音開'}
             </button>
          </div>
        )}


        {/* AI 特效圖層 */}
        {effectEnabled && resolvedScript && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden font-sans">

            {/* 常駐左上角標籤 */}
            {!activeEffects.cover && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-white/85 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/50">
                <span className="text-[10px] sm:text-xs font-bold text-[#6d6d6d]">✨ ユキ&トモヤ｜日本實拍</span>
              </div>
            )}

            {/* 1. 雜誌風封面 (0:00 ~ 0:02.5) */}
            {activeEffects.cover && (
              <div className="absolute inset-0 z-20 flex flex-col bg-gradient-to-b from-black/30 via-transparent to-black/40 animate-in fade-in duration-500">
                <div className="w-full bg-[#78C4EC]/95 text-white text-center py-1 px-3 text-xs font-bold tracking-widest uppercase">
                  {resolvedScript.cover?.issue}
                </div>

                <div className="flex-1 flex flex-col items-center justify-start pt-12 sm:pt-20 px-6">
                  <h1 className="text-white text-2xl sm:text-3xl font-black text-center leading-tight drop-shadow-lg scale-in-center tracking-wide">
                    {resolvedScript.cover?.title}
                  </h1>
                  {resolvedScript.cover?.subtitle && (
                    <p className="mt-3 text-white/90 text-xs font-medium tracking-widest drop-shadow-md">
                      {resolvedScript.cover.subtitle}
                    </p>
                  )}
                </div>

                {/* 裝飾印章 */}
                {resolvedScript.cover?.stamp && (
                  <div className="absolute top-8 right-4 w-12 h-12 rounded-full border-2 border-[#78C4EC] bg-[#78C4EC]/10 backdrop-blur flex items-center justify-center rotate-[-15deg]">
                     <span className="text-[#78C4EC] font-bold text-xs text-center leading-tight">
                        {resolvedScript.cover.stamp.split("").join("\n")}
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

                <div className="absolute bottom-10 left-3 flex justify-between items-end">
                  <div className="bg-white/20 backdrop-blur-md border border-white/40 rounded-xl px-2.5 py-1">
                    <p className="text-white/80 text-[10px] mb-0.5">{resolvedScript.cover?.speakerTitle}</p>
                    <p className="text-white font-bold text-xs">｜{resolvedScript.cover?.speakerName}</p>
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

            {/* Outro End Card */}
            {activeEffects.outro && resolvedScript.outro && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-white/20">
                   <div className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-bold bg-[#78C4EC]/10 text-[#78C4EC] border border-[#78C4EC]/20">
                     {resolvedScript.outro.badge}
                   </div>
                   <h2 className="text-[#333] text-xl sm:text-2xl font-black mb-6 leading-tight">
                     {resolvedScript.outro.title}
                   </h2>
                   <ul className="space-y-4 mb-6">
                     {(resolvedScript.outro.points || []).map((pt, i) => (
                       <li key={i} className="flex gap-3 text-[#444] text-sm sm:text-base font-bold leading-relaxed">
                         <span>{pt.substring(0, 3)}</span>
                         <span>{pt.substring(3)}</span>
                       </li>
                     ))}
                   </ul>
                   <div className="text-[#6d6d6d] text-xs font-bold text-center pt-4 border-t border-gray-100">
                     {resolvedScript.outro.credit}
                   </div>
                </div>
                {resolvedScript.outro.cta && (
                  <div className="mt-6 bg-[#06C755] text-white px-6 py-3 rounded-full font-bold shadow-lg text-sm sm:text-base animate-bounce">
                    {resolvedScript.outro.cta}
                  </div>
                )}
              </div>
            )}

            {/* 6. 動態底部字幕 */}
            {activeEffects.subtitle && !activeEffects.cover && !activeEffects.outro && (
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
            onClick={() => { unlockAudio(); setIsFullscreen(true); }}
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

      {!isFullscreen && (
        <>
          {/* 控制列 */}
                <div className="flex flex-wrap items-center justify-center gap-3 bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-2xl shadow-sm border border-[#bbe3f8] mt-2 w-full max-w-sm sm:max-w-md">
                  <button
                    onClick={() => { unlockAudio(); setEffectEnabled(!effectEnabled); }}
                    disabled={(!resolvedScript) || isExporting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                      (!resolvedScript) ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400" :
                      effectEnabled
                        ? "bg-[#78C4EC] text-white shadow-md hover:bg-[#6db3e0]"
                        : "bg-gray-100 text-[#6d6d6d] hover:bg-gray-200"
                    }`}
                  >
                    {effectEnabled ? <Sparkles className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                    {effectEnabled ? "✨ AI 特效開啟" : "🎬 原始影片"}
                  </button>

                  <button
                    onClick={() => { unlockAudio(); setSoundEnabled(!soundEnabled); }}
                    disabled={(!resolvedScript) || isExporting || !effectEnabled}
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
                    onClick={() => { unlockAudio(); setJumpCutEnabled(!jumpCutEnabled); }}
                    disabled={(!resolvedScript) || isExporting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                      (!resolvedScript) ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400" :
                      jumpCutEnabled
                        ? "bg-[#78C4EC] text-white shadow-md hover:bg-[#6db3e0]"
                        : "bg-gray-100 text-[#6d6d6d] hover:bg-gray-200"
                    }`}
                  >
                    {jumpCutEnabled ? "✂️ 氣口剪輯：開" : "✂️ 氣口剪輯：關"}
                  </button>

                  <button
                    onClick={() => { unlockAudio(); setIsFullscreen(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors bg-gray-100 text-[#6d6d6d] hover:bg-gray-200"
                  >
                    ⛶ 全螢幕放大
                  </button>

                  {isPreviewMode && (
                    <button
                      onClick={() => { unlockAudio(); exportVideo(); }}
                      disabled={(!resolvedScript) || !effectEnabled || isExporting}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-white text-[#78C4EC] border border-[#78C4EC] hover:bg-[#F2FAFD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                    >
                      <Download className="w-4 h-4" />
                      🎬 匯出完整 MP4 影片 (v5.1)
                    </button>
                  )}
                </div>

                {/* 匯出結果區塊 */}
                {isPreviewMode && exportedUrl && exportedFile && (
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
        </>
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