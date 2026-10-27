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
  showCover?: boolean;
  showOutro?: boolean;
  showBadge?: boolean;
  showCards?: boolean;
  showSubtitles?: boolean;
  audioConfig?: { clipMuted?: boolean[] };
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


const BRAND_30S_STITCHED_SCRIPT = {
  showCover: false,
  showOutro: false,
  showCards: false,
  showSubtitles: true,
  audioConfig: { clipMuted: [false, true, false] },
  subtitles: [
    { start: 0.8, end: 5.0, text: "YUKI & TOMOYA 日本仙台職人生活選物", highlight: "YUKI & TOMOYA", color: "sky" },
    { start: 5.0, end: 10.0, text: "為您精選獨具匠心的日本好物", highlight: "精選獨具匠心", color: "amber" },
    { start: 10.0, end: 15.0, text: "質感生活，從這裡開始", highlight: "質感生活", color: "sky" },
    { start: 15.0, end: 20.0, text: "探索更多精選商品，體驗日本職人精神", highlight: "日本職人精神", color: "amber" },
    { start: 20.0, end: 25.0, text: "歡迎來到 YUKI & TOMOYA 的世界", highlight: "YUKI & TOMOYA", color: "sky" }
  ]
};

const COACH_PRAISE_39S_SCRIPT = {
  cover: { issue: "ISSUE 08｜日本仙台・草野塾特訓花絮", title: "前日職名將的高度肯定！", subtitle: "草野大輔教練 盛讚智也學習力與打擊天賦", stamp: "教練盛讚", speakerName: "草野大輔 教練 × 智也", speakerTitle: "日本仙台草野塾 課後總評" },
  outro: { badge: "⚾ 仙台草野塾 × ユキ&トモヤ｜特訓成長紀錄", title: "草野大輔教練 給予智也 3 大盛讚", points: ["1️⃣ 吸收超快（吸収が早い）：指導動作要領一點就通", "2️⃣ 反應極佳（反応が良い）：身體協調性與調整力出色", "3️⃣ 棒球天賦（センスがある）：職棒教練認證的極佳球感"], credit: "指導：草野大輔 教練｜選手：智也 (Tomoya)", cta: "💬 ユキ&トモヤ 日本選物 & 台日少棒交流｜歡迎 LINE 諮詢" },
  subtitles: [
    { start: 0.0, end: 3.2, text: "【仙台草野塾】特訓告一段落，聽聽草野教練對智也的評價！", highlight: "草野教練對智也的評價", color: "sky" },
    { start: 3.2, end: 6.2, text: "翻譯：「剛開始只要好好伸展、把動作舒展開來就行了」", highlight: "好好伸展", color: "sky" },
    { start: 6.2, end: 8.6, text: "經過剛才的揮棒軌跡微調，草野教練對智也表現非常驚豔！", highlight: "非常驚豔", color: "amber" },
    { start: 8.6, end: 11.8, text: "草野教練：「吸収が早いね！色々覚えるのが（吸收超快呢！）」", highlight: "吸収が早いね", color: "amber" },
    { start: 11.8, end: 15.2, text: "現場翻譯：「吸收很快呢，學東西真快呀！」（媽媽開心笑出來）", highlight: "學東西真快呀", color: "sky" },
    { start: 15.2, end: 18.4, text: "草野教練：「反応が良くて、素晴らしいと思います！」", highlight: "素晴らしい", color: "amber" },
    { start: 18.4, end: 21.8, text: "現場翻譯：「身體反應很好，我覺得表現得非常棒！」", highlight: "表現得非常棒", color: "sky" },
    { start: 21.8, end: 24.8, text: "草野教練再加碼肯定：「センスがあるね！（很有天賦喔！）」", highlight: "センスがあるね", color: "coral" },
    { start: 24.8, end: 27.2, text: "獲得前日職樂天金鷲名將「很有天賦」的最高評價！", highlight: "很有天賦", color: "amber" },
    { start: 27.2, end: 30.6, text: "媽媽小聲提醒：「要說什麼？」智也突然害羞卡詞：「啊…啊…」", highlight: "害羞卡詞", color: "coral" },
    { start: 30.6, end: 34.0, text: "全場瞬間笑翻！草野教練也被智也可愛的反應逗樂了 😂", highlight: "全場瞬間笑翻", color: "amber" },
    { start: 34.0, end: 39.2, text: "智也鞠躬道謝：「ありがとうございます！（非常感謝教練！）」", highlight: "ありがとうございます", color: "sky" }
  ],
  events: [
    { id: "p1", type: "qa_bubble", start: 3.2, end: 8.4, side: "left", author: "草野塾・課後總評", title: "第一次接受日本職棒級指導，智也表現如何？", sfx: "pop" },
    { id: "p2", type: "numbered_pill", number: 1, start: 8.6, end: 26.8, side: "left", title: "吸收超快（吸収が早い）", sfx: "pop" },
    { id: "p3", type: "big_impact", start: 9.0, end: 14.5, side: "center", title: "學東西超快！", badge: "教練驚豔", strikeThrough: false, zoom: true, sfx: "ding" },
    { id: "p4", type: "numbered_pill", number: 2, start: 15.2, end: 26.8, side: "right", title: "反應極佳（反応が良い）", sfx: "pop" },
    { id: "p5", type: "progress_card", start: 15.8, end: 21.5, side: "left", badge: "GREAT!", title: "身體協調與領悟力：滿分肯定", icon: "🌟", sfx: "pop" },
    { id: "p6", type: "numbered_pill", number: 3, start: 22.0, end: 26.8, side: "left", title: "極具天賦（センスがある）", sfx: "pop" },
    { id: "p7", type: "big_impact", start: 22.5, end: 26.8, side: "center", title: "很有棒球天賦", badge: "センス◎", strikeThrough: false, zoom: true, sfx: "ding" },
    { id: "p8", type: "qa_bubble", start: 27.2, end: 33.8, side: "right", author: "溫馨爆笑名場面", title: "媽媽提醒道謝，智也害羞卡詞全場大笑 😂", sfx: "pop" },
    { id: "p9", type: "checklist_card", start: 33.8, end: 36.2, side: "left", title: "草野教練 3 大認證", items: ["動作吸收速度超快", "身體反應非常棒", "具備優秀棒球天賦"], sfx: "ding" }
  ]
};

export default function AiVideoPlayer({
  videoUrl,
  aiScript,
  poster,
  isPreviewProp,
  videoUrls
}: {
  videoUrl: string;
  aiScript: AiScript | null;
  poster?: string;
  isPreviewProp?: boolean;
  videoUrls?: string[];
}) {

  const isPreviewMode = Boolean(isPreviewProp || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === 'video'));

  const clips = (videoUrls && videoUrls.length > 0) ? videoUrls : (videoUrl ? [videoUrl] : []);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [clipDurations, setClipDurations] = useState<number[]>([]);
  const [globalTime, setGlobalTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  let resolvedScript = aiScript;

  // Script Resolution Logic
  const aiScriptStr = JSON.stringify(aiScript || {});
  const isHallucinated = aiScriptStr.includes('香水瓶') || aiScriptStr.includes('禮物盒') || aiScriptStr.includes('探索日本精品') || aiScriptStr.includes('日本商品開箱介紹');
  const isValidScript = aiScript && aiScript.subtitles && aiScript.subtitles.length >= 3 && !isHallucinated;
  const isMultiClip = clips.length >= 2;

  if (isValidScript) {
    resolvedScript = aiScript;
  } else {
    // Dynamic fallback based on video duration
    const currentDuration = videoRef.current?.duration || 0;
    if (currentDuration > 0 && currentDuration <= 50) {
      resolvedScript = (isMultiClip ? BRAND_30S_STITCHED_SCRIPT : COACH_PRAISE_39S_SCRIPT) as any;
    } else if (currentDuration > 50) {
      resolvedScript = FULL_71S_SCRIPT as any;
    } else {
      // Default to 39s if duration is unknown yet, we can update later but initially
      resolvedScript = COACH_PRAISE_39S_SCRIPT as any;
    }
  }

  const rawVideoArrayBufferRefs = useRef<(ArrayBuffer | null)[]>([]);
  const decodedAudioBufferRefs = useRef<(AudioBuffer | null)[]>([]);

  useEffect(() => {
    rawVideoArrayBufferRefs.current = new Array(clips.length).fill(null);
    clips.forEach((url, i) => {
      fetch(url)
        .then(res => res.arrayBuffer())
        .then(buf => { rawVideoArrayBufferRefs.current[i] = buf; })
        .catch(() => {});
    });
  }, [clips]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isVertical, setIsVertical] = useState(false);

  // Local toggle for effect without changing redis
  const [effectEnabled, setEffectEnabled] = useState(resolvedScript?.enabled !== false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [jumpCutEnabled, setJumpCutEnabled] = useState(false);
  const [currentSpeechZoom, setCurrentSpeechZoom] = useState<number>(1);
  const [cardsVisible, setCardsVisible] = useState(resolvedScript?.showCards !== false);
  const [subtitlesVisible, setSubtitlesVisible] = useState(resolvedScript?.showSubtitles !== false);

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
  const [hasStarted, setHasStarted] = useState(false);

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
    const pastDuration = clipDurations.slice(0, currentClipIndex).reduce((a, b) => a + b, 0);
    setGlobalTime(pastDuration + cTime);
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

  const coverEnd = 3.2; // 0.0 - 3.2s
  const outroStart = (videoRef.current?.duration || 39) > 10 ? (videoRef.current?.duration || 39) - 3.5 : 999;

  let rawActiveEvents = allEvents.filter((e) => currentTime >= e.start && currentTime <= e.end);

  // 1. Strict Intro / Outro Isolation
  if (currentTime <= coverEnd + 0.2 || currentTime >= outroStart - 0.2) {
      rawActiveEvents = [];
  }

  // 2. Automatic Anti-Overlap Layout Guard Engine
  const cards = rawActiveEvents.filter(e => ['qa_bubble', 'myth_buster', 'progress_card', 'checklist_card', 'target_focus'].includes(e.type));
  const activeCardsLeft = cards.filter(e => e.side === 'left');
  const activeCardsRight = cards.filter(e => e.side === 'right');

  let finalActiveEvents = [...rawActiveEvents];

  // If a large card is active on a side, temporarily hide numbered_pills on that SAME side
  if (activeCardsLeft.length > 0) {
      finalActiveEvents = finalActiveEvents.filter(e => !(e.type === 'numbered_pill' && e.side === 'left'));
  }
  if (activeCardsRight.length > 0) {
      finalActiveEvents = finalActiveEvents.filter(e => !(e.type === 'numbered_pill' && e.side === 'right'));
  }

  const activeEffects = {
    cover: resolvedScript?.cover && currentTime >= 0 && currentTime <= coverEnd,
    subtitle: resolvedScript?.subtitles?.find((s) => currentTime >= s.start && currentTime <= s.end),
    events: finalActiveEvents,
    outro: resolvedScript?.outro && currentTime >= outroStart,
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
const renderSubtitleText = (text: string, highlight?: string, color?: string) => {
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

        const totalDuration = clipDurations.reduce((a, b) => a + b, 0) || v.duration || 30;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get 2d context");

        const vw = v.videoWidth || 720;
        const vh = v.videoHeight || 1280;
        canvas.width = Math.floor(vw / 2) * 2;
        canvas.height = Math.floor(vh / 2) * 2;

        const canvasStream = canvas.captureStream(30);

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioContextRef.current && AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        }
        const actx = audioContextRef.current;
        if (!actx) throw new Error("AudioContext not supported");
        if (actx.state === 'suspended') {
          actx.resume();
        }

        const audioDest = actx.createMediaStreamDestination();
        exportDestRef.current = audioDest;

        const keepAliveOsc = actx.createOscillator();
        const keepAliveGain = actx.createGain();
        keepAliveGain.gain.value = 0.0001;
        keepAliveOsc.connect(keepAliveGain);
        keepAliveGain.connect(audioDest);
        keepAliveOsc.start();

        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...audioDest.stream.getAudioTracks()
        ]);

        const chunks: BlobPart[] = [];
        let mediaRecorder: MediaRecorder;

        try {
            mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/mp4' });
        } catch {
            try {
                mediaRecorder = new MediaRecorder(combinedStream);
            } catch {
                mediaRecorder = new MediaRecorder(canvasStream);
            }
        }

        mediaRecorder.start(200);

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        const recordingPromise = new Promise<Blob>((resolve) => {
            mediaRecorder.onstop = () => {
                keepAliveOsc.stop();
                resolve(new Blob(chunks, { type: mediaRecorder.mimeType || 'video/mp4' }));
            };
        });

        const containerRect = containerRef.current.getBoundingClientRect();
        const scaleX = vw / containerRect.width;
        const scaleY = vh / containerRect.height;

        let globalExportTime = 0;

        for (let clipIdx = 0; clipIdx < clips.length; clipIdx++) {
            v.src = clips[clipIdx];
            await new Promise(r => { v.onloadedmetadata = r; });
            const clipDuration = v.duration;

            v.muted = true;
            v.currentTime = 0;
            await v.play();

            let sourceNode: AudioBufferSourceNode | null = null;
            const isMuted = resolvedScript?.audioConfig?.clipMuted?.[clipIdx];
            if (!isMuted) {
                if (!decodedAudioBufferRefs.current[clipIdx] && rawVideoArrayBufferRefs.current[clipIdx]) {
                  decodedAudioBufferRefs.current[clipIdx] = await actx.decodeAudioData(rawVideoArrayBufferRefs.current[clipIdx].slice(0));
                }

                v.currentTime = 0;

                if (decodedAudioBufferRefs.current[clipIdx]) {
                   sourceNode = actx.createBufferSource();
                   sourceNode.buffer = decodedAudioBufferRefs.current[clipIdx];
                   sourceNode.connect(audioDest);
                   sourceNode.connect(actx.destination);
                   sourceNode.start(0, 0);
                }
            }

            await new Promise<void>((resolveClip) => {
                const drawFrame = async () => {
                    if (v.ended || v.currentTime >= clipDuration - 0.15) {
                        if (sourceNode) sourceNode.stop();
                        resolveClip();
                        return;
                    }

                    const currentGlobalTime = globalExportTime + v.currentTime;
                    setExportProgress(Math.floor((currentGlobalTime / totalDuration) * 100));

                    ctx.clearRect(0, 0, vw, vh);

                    try {
                        let isZoom = false;
                        if (effectEnabled && resolvedScript) {
                            const activeChecklist = resolvedScript.checklistCard && currentGlobalTime >= resolvedScript.checklistCard.start && currentGlobalTime <= resolvedScript.checklistCard.end;
                            const activeBigK = resolvedScript.bigKeywords?.find((k) => currentGlobalTime >= k.start && currentGlobalTime <= k.end);
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
                            const cTime = currentGlobalTime;

                            ctx.textAlign = 'left';
                            ctx.textBaseline = 'middle';
                            const cx = vw / 2;
                            const cy = vh / 2;

                            if (!(resolvedScript.cover && resolvedScript.showCover !== false && cTime <= 3.5)) {
                                ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
                                ctx.beginPath();
                                ctx.roundRect(vw * 0.03, vh * 0.05, vw * 0.28, vh * 0.075, vh * 0.0375);
                                ctx.fill();

                                ctx.fillStyle = "#6d6d6d";
                                ctx.textAlign = "left";
                                ctx.textBaseline = "middle";
                                ctx.font = `bold ${vh * 0.035}px "PingFang TC", "Hiragino Sans", "Microsoft JhengHei", sans-serif`;
                                ctx.fillText("✨ ユキ&トモヤ｜日本實拍", vw * 0.03 + vw * 0.02, vh * 0.05 + vh * 0.0375);
                                ctx.textBaseline = "alphabetic";
                            }

                            if (resolvedScript.cover && resolvedScript.showCover !== false && cTime <= 3.5) {
                                ctx.fillStyle = "rgba(120, 196, 236, 0.9)";
                                ctx.fillRect(0, 0, vw, 40 * scaleY);
                                ctx.fillStyle = "#ffffff";
                                ctx.font = `bold ${14 * scaleY}px "PingFang TC", "Hiragino Sans", "Microsoft JhengHei", sans-serif`;
                                ctx.textAlign = "center";
                                ctx.fillText(`ユキ&トモヤ｜${resolvedScript.cover.issue}`, cx, 20 * scaleY);

                                ctx.fillStyle = "#ffffff";
                                ctx.font = `bold ${36 * scaleY}px "PingFang TC", "Hiragino Sans", "Microsoft JhengHei", sans-serif`;
                                ctx.textAlign = "center";
                                ctx.shadowColor = "rgba(0,0,0,0.5)";
                                ctx.shadowBlur = 10;
                                ctx.fillText(resolvedScript.cover.title, cx, cy - 40 * scaleY);
                                ctx.shadowBlur = 0;

                                if (resolvedScript.cover.subtitle) {
                                    ctx.font = `bold ${16 * scaleY}px "PingFang TC", "Hiragino Sans", "Microsoft JhengHei", sans-serif`;
                                    ctx.fillText(resolvedScript.cover.subtitle, cx, cy + 10 * scaleY);
                                }
                            }

                            const isOutro = resolvedScript.outro && resolvedScript.showOutro !== false && totalDuration > 10 && cTime >= totalDuration - 3.3;

                            const allEventsForCards = (resolvedScript.events || resolvedScript.numberedPills || []).map((e: any) => ({...e, type: e.type || 'numbered_pill'}));
                            const activeEvts = cardsVisible ? allEventsForCards.filter((e: any) => cTime >= e.start && cTime <= e.end) : [];

                            for (const evt of activeEvts) {
                                ctx.textAlign = 'left';
                                ctx.textBaseline = 'middle';

                                if (evt.type === 'numbered_pill') {
                                    const ex = evt.side === 'left' ? vw * 0.05 : vw * 0.55;
                                    const ey = vh * 0.15 + (evt.side === 'right' ? vh * 0.05 : 0);
                                    const pW = vw * 0.4;
                                    const pH = vh * 0.06;
                                    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
                                    ctx.beginPath();
                                    ctx.roundRect(ex, ey, pW, pH, pH / 2);
                                    ctx.fill();

                                    ctx.fillStyle = "#78C4EC";
                                    ctx.beginPath();
                                    ctx.arc(ex + pH / 2, ey + pH / 2, pH * 0.35, 0, Math.PI * 2);
                                    ctx.fill();

                                    ctx.fillStyle = "white";
                                    ctx.font = `bold ${pH * 0.5}px sans-serif`;
                                    ctx.textAlign = "center";
                                    ctx.textBaseline = "middle";
                                    ctx.fillText((evt.number || 1).toString(), ex + pH / 2, ey + pH / 2);

                                    ctx.textAlign = "left";
                                    ctx.fillStyle = "white";
                                    ctx.font = `bold ${pH * 0.4}px "PingFang TC", "Microsoft JhengHei"`;
                                    ctx.fillText(evt.title || evt.text, ex + pH * 1.1, ey + pH / 2);
                                } else if (evt.type === 'qa_bubble') {
                                    const ex = vw * 0.05;
                                    const ey = cy - vh * 0.1;
                                    const pW = vw * 0.9;
                                    const pH = vh * 0.12;
                                    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
                                    ctx.beginPath();
                                    ctx.roundRect(ex, ey, pW, pH, vh * 0.03);
                                    ctx.fill();

                                    ctx.fillStyle = "#78C4EC";
                                    ctx.font = `bold ${pH * 0.25}px sans-serif`;
                                    ctx.textAlign = "left";
                                    ctx.textBaseline = "middle";
                                    ctx.fillText(`🙋 ${evt.author || "Q&A"}`, ex + vw * 0.04, ey + pH * 0.3);

                                    ctx.fillStyle = "white";
                                    ctx.font = `bold ${pH * 0.35}px "PingFang TC", "Microsoft JhengHei"`;
                                    ctx.fillText(evt.title, ex + vw * 0.04, ey + pH * 0.7);
                                } else if (evt.type === 'big_impact') {
                                    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
                                    ctx.textAlign = "center";
                                    ctx.textBaseline = "middle";

                                    if (evt.badge) {
                                       const bw = vw * 0.3;
                                       const bh = vh * 0.06;
                                       ctx.beginPath();
                                       ctx.roundRect(cx - bw/2, cy - vh*0.12 - bh/2, bw, bh, bh/2);
                                       ctx.fill();
                                       ctx.fillStyle = "#F59E0B";
                                       ctx.font = `bold ${bh * 0.5}px sans-serif`;
                                       ctx.fillText(evt.badge, cx, cy - vh*0.12);
                                    }

                                    ctx.fillStyle = "white";
                                    ctx.font = `bold ${vh * 0.08}px "PingFang TC", "Microsoft JhengHei"`;
                                    ctx.fillText(evt.title, cx, cy);

                                    if (evt.strikeThrough) {
                                       ctx.strokeStyle = "#EF4444";
                                       ctx.lineWidth = vh * 0.01;
                                       ctx.beginPath();
                                       const tw = ctx.measureText(evt.title).width;
                                       ctx.moveTo(cx - tw/2 - 10, cy);
                                       ctx.lineTo(cx + tw/2 + 10, cy);
                                       ctx.stroke();
                                    }
                                } else if (evt.type === 'myth_buster') {
                                    const ex = vw * 0.05;
                                    const ey = cy + vh * 0.05;
                                    const pW = vw * 0.9;
                                    const pH = vh * 0.12;
                                    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
                                    ctx.beginPath();
                                    ctx.roundRect(ex, ey, pW, pH, vh * 0.03);
                                    ctx.fill();

                                    ctx.fillStyle = "#EF4444";
                                    ctx.font = `bold ${pH * 0.25}px sans-serif`;
                                    ctx.textAlign = "left";
                                    ctx.textBaseline = "middle";
                                    ctx.fillText(`❌ ${evt.badge || "迷思"}`, ex + vw * 0.04, ey + pH * 0.3);

                                    ctx.fillStyle = "white";
                                    ctx.font = `bold ${pH * 0.35}px "PingFang TC", "Microsoft JhengHei"`;
                                    ctx.fillText(evt.title, ex + vw * 0.04, ey + pH * 0.7);
                                } else if (evt.type === 'checklist_card') {
                                    const ex = vw * 0.05;
                                    const ey = cy - vh * 0.15;
                                    const pW = vw * 0.9;
                                    const pH = vh * 0.3;
                                    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
                                    ctx.beginPath();
                                    ctx.roundRect(ex, ey, pW, pH, vh * 0.03);
                                    ctx.fill();

                                    ctx.fillStyle = "#78C4EC";
                                    ctx.font = `bold ${vh * 0.035}px sans-serif`;
                                    ctx.textAlign = "left";
                                    ctx.textBaseline = "middle";
                                    ctx.fillText(`✅ ${evt.title}`, ex + vw * 0.05, ey + vh * 0.05);

                                    ctx.fillStyle = "white";
                                    ctx.font = `bold ${vh * 0.03}px "PingFang TC", "Microsoft JhengHei"`;
                                    (evt.items || []).forEach((item: any, i: number) => {
                                        ctx.fillText(`• ${item}`, ex + vw * 0.05, ey + vh * 0.12 + (i * vh * 0.05));
                                    });
                                }
                            }

                            if (isOutro) {
                                ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
                                ctx.beginPath();
                                ctx.roundRect(vw * 0.05, cy - vh * 0.2, vw * 0.9, vh * 0.4, vh * 0.03);
                                ctx.fill();

                                ctx.textAlign = "center";
                                ctx.textBaseline = "middle";

                                ctx.fillStyle = "#78C4EC";
                                ctx.font = `bold ${vh * 0.02}px sans-serif`;
                                ctx.fillText(resolvedScript.outro.badge, cx, cy - vh * 0.15);

                                ctx.fillStyle = "#0F172A";
                                ctx.font = `bold ${vh * 0.04}px "PingFang TC", "Microsoft JhengHei"`;
                                ctx.fillText(resolvedScript.outro.title, cx, cy - vh * 0.08);

                                ctx.fillStyle = "#444444";
                                ctx.font = `bold ${vh * 0.025}px "PingFang TC", "Microsoft JhengHei"`;
                                (resolvedScript.outro.points || []).forEach((pt: any, i: number) => {
                                    ctx.fillText(pt, cx, cy + (i * vh * 0.04));
                                });

                                ctx.fillStyle = "#666666";
                                ctx.font = `bold ${vh * 0.018}px sans-serif`;
                                ctx.fillText(resolvedScript.outro.credit, cx, cy + vh * 0.15);
                            }

                            const activeSub = resolvedScript.subtitles?.find(s => cTime >= s.start && cTime <= s.end);
                            if (activeSub && !isOutro && !(resolvedScript.cover && resolvedScript.showCover !== false && cTime <= 3.5) && subtitlesVisible) {
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                const subY = vh * 0.88;
                                const subW = vw * 0.85;
                                const subH = vh * 0.07;

                                ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
                                ctx.beginPath();
                                ctx.roundRect(cx - subW/2, subY - subH/2, subW, subH, subH/2);
                                ctx.fill();

                                ctx.font = `bold ${vh * 0.032}px "PingFang TC", "Microsoft JhengHei"`;

                                if (activeSub.highlight) {
                                    const parts = activeSub.text.split(activeSub.highlight);
                                    let currentX = cx - ctx.measureText(activeSub.text).width / 2;

                                    ctx.fillStyle = "white";
                                    ctx.textAlign = 'left';
                                    if (parts[0]) {
                                        ctx.fillText(parts[0], currentX, subY);
                                        currentX += ctx.measureText(parts[0]).width;
                                    }

                                    const highlightColors: any = {
                                        sky: "#78C4EC",
                                        amber: "#FCD34D",
                                        coral: "#F87171"
                                    };
                                    ctx.fillStyle = highlightColors[activeSub.color || 'sky'] || "#78C4EC";
                                    ctx.fillText(activeSub.highlight, currentX, subY);
                                    currentX += ctx.measureText(activeSub.highlight).width;

                                    ctx.fillStyle = "white";
                                    if (parts[1]) {
                                        ctx.fillText(parts[1], currentX, subY);
                                    }
                                } else {
                                    ctx.fillStyle = "white";
                                    ctx.fillText(activeSub.text, cx, subY);
                                }
                            }
                        }
                    } catch (err) {
                        console.error("Canvas draw error", err);
                    }

                    requestAnimationFrame(drawFrame);
                };
                requestAnimationFrame(drawFrame);
            });

            globalExportTime += clipDuration;
        }

        mediaRecorder.stop();
        const finalBlob = await recordingPromise;
        const fileUrl = URL.createObjectURL(finalBlob);
        setExportedUrl(fileUrl);
        setExportedFile(new File([finalBlob], "yuki-tomoya-video.mp4", { type: "video/mp4" }));

    } catch (error) {
        console.error("Export failed:", error);
        alert("影片匯出失敗");
    } finally {
        setIsExporting(false);
    }
  }, [effectEnabled, resolvedScript, clips, clipDurations, cardsVisible, subtitlesVisible]);

  return (
    <div className={`flex flex-col items-center gap-4 w-full ${isFullscreen ? 'fixed inset-0 z-[99999] bg-black/95 justify-center h-[100dvh]' : ''}`}>
      {/* 全螢幕頂部列 */}
      {isFullscreen && (
        <>
          <button onClick={() => setIsRotated(!isRotated)} className="absolute top-4 left-4 z-50 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold text-sm backdrop-blur transition">
            🔄 橫向滿版
          </button>
          <button onClick={() => { setIsFullscreen(false); setIsRotated(false); }} className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold text-sm backdrop-blur transition">
            ✕ 關閉全螢幕
          </button>
        </>
      )}

      {/* 播放器容器 */}
      <div onClick={(e) => {
        unlockAudio();
        // Ignore clicks on buttons/inputs
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.tagName === 'BUTTON' || target.tagName === 'INPUT') return;
        const v = videoRef.current;
        if (v && hasStarted) {
          if (v.paused) v.play().catch(() => { v.muted = true; v.play(); });
          else v.pause();
        }
      }} className={`${containerClass} ${isFullscreen && isRotated ? 'rotate-90 w-[100dvh] h-[100vw] origin-center' : ''}`} ref={containerRef}>
        <video
          ref={videoRef}
          src={clips[currentClipIndex] || videoUrl}
          poster={poster || undefined}
          autoPlay
          playsInline
          controls={false}
          controlsList={!isPreviewMode ? "nodownload" : undefined}
          onContextMenu={!isPreviewMode ? (e) => e.preventDefault() : undefined}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => { setIsPlaying(true); setHasStarted(true); }}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={(e) => {
            const duration = e.currentTarget.duration;
            setClipDurations(prev => {
                const updated = [...prev];
                updated[currentClipIndex] = duration;
                return updated;
            });
            handleLoadedMetadata(e as any);
          }}
          onEnded={() => {
            if (currentClipIndex < clips.length - 1) {
              setCurrentClipIndex(prev => prev + 1);
            } else {
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
                setCurrentClipIndex(0);
                videoRef.current.play();
              }
            }
          }}
          className={videoClass}
        />

        {/* Playback Overlays */}
        {!hasStarted && !isExporting && (
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

        {hasStarted && !isPlaying && !isExporting && (
          <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
            <div className="pointer-events-auto bg-black/50 text-white p-4 rounded-full backdrop-blur-sm cursor-pointer hover:bg-black/70 transition shadow-xl border border-white/20"
                 onClick={(e) => {
                   e.stopPropagation();
                   const v = videoRef.current;
                   if (v && v.paused) v.play().catch(() => { v.muted = true; v.play(); });
                 }}
            >
              <div className="flex items-center gap-2 text-lg font-bold pr-2">
                <span className="text-2xl">▶</span> 繼續播放
              </div>
            </div>
          </div>
        )}

        {/* Bottom Playback Bar */}
        {!isExporting && (
          <div className="absolute bottom-2 left-3 right-3 z-40 flex items-center justify-between gap-2 bg-slate-900/75 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs pointer-events-auto shadow-lg border border-white/10">
             <button
                onClick={(e) => {
                  e.stopPropagation();
                  const v = videoRef.current;
                  if (v) {
                    if (v.paused) v.play().catch(() => { v.muted = true; v.play(); });
                    else v.pause();
                  }
                }}
                className="hover:text-[#78C4EC] transition font-bold shrink-0"
             >
                {isPlaying ? '⏸ 暫停' : '▶ 播放'}
             </button>

             <div className="flex-1 flex items-center gap-2 px-2">
               <input
                 type="range"
                 min={0}
                 max={videoRef.current?.duration || 71}
                 step={0.1}
                 value={currentTime}
                 onChange={(e) => {
                   const t = parseFloat(e.target.value);
                   if (videoRef.current) videoRef.current.currentTime = t;
                   setCurrentTime(t);
                 }}
                 className="flex-1 accent-sky-400 h-1 cursor-pointer"
               />
               <span className="font-bold tracking-wider shrink-0 text-[10px] sm:text-xs">
                 {formatTime(currentTime)} / {formatTime(videoRef.current?.duration || 71)}
               </span>
             </div>

             <button
                onClick={(e) => {
                  e.stopPropagation();
                  const v = videoRef.current;
                  if (v) {
                    v.muted = !v.muted;
                    setIsVideoMuted(v.muted);
                    setSoundEnabled(!v.muted);
                  }
                }}
                className="hover:text-[#78C4EC] transition font-bold shrink-0"
             >
                {isVideoMuted ? '🔇 已靜音' : '🔊 聲音：開'}
             </button>

             {!isFullscreen && (
               <button
                 onClick={(e) => { e.stopPropagation(); unlockAudio(); setIsFullscreen(true); }}
                 className="hover:text-[#78C4EC] transition font-bold shrink-0 ml-1 border-l border-white/20 pl-2"
               >
                 ⛶ 放大
               </button>
             )}
          </div>
        )}


        {/* AI 特效圖層 */}
        {effectEnabled && resolvedScript && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden font-sans">

            {/* 常駐左上角標籤 */}
            {!activeEffects.cover && (
              <div className="absolute z-10 flex items-center justify-center bg-white/95 px-3 rounded-full shadow-sm border border-white/50" style={{ top: '5%', left: '3%', width: '28%', height: '7.5%' }}>
                <span className="font-bold text-[#6d6d6d] whitespace-nowrap" style={{ fontSize: '3.5cqh' }}>✨ ユキ&トモヤ｜日本實拍</span>
              </div>
            )}

            {/* 1. 雜誌風封面 (0:00 ~ 0:02.5) */}
            {activeEffects.cover && (
              <div className="absolute inset-0 z-20 flex flex-col bg-gradient-to-b from-black/30 via-transparent to-black/40 animate-in fade-in duration-500">
                <div className="w-full bg-[#78C4EC]/95 text-white text-center py-1 px-3 text-xs font-bold tracking-widest uppercase">
                  {resolvedScript.cover?.issue}
                </div>

                <div className="flex-1 flex flex-col items-center justify-start pt-12 sm:pt-20 px-6">
                  <h1 className="text-white text-2xl sm:text-3xl font-bold text-center leading-tight drop-shadow-lg scale-in-center tracking-wide">
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
                        <h2 className="text-[#0F172A] text-lg font-extrabold leading-tight">{evt.title || evt.question}</h2>
                      </div>
                    </div>
                  );
                case 'myth_buster':
                  return (
                    <div key={evt.id} className={`absolute inset-0 z-20 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm ${baseAnim}`}>
                      <div className="bg-white/95 rounded-2xl p-6 shadow-2xl max-w-xs text-center border-4 border-red-500 relative">
                        <div className="absolute -top-8 -left-8 text-6xl drop-shadow-md text-red-500 rotate-[-15deg]">🚫</div>
                        <h2 className="text-[#0F172A] text-xl font-bold mt-2">{evt.title}</h2>
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
                      <span className="text-[#0F172A] font-bold text-sm">{evt.title}</span>
                    </div>
                  );
                case 'big_impact':
                  return (
                    <div key={evt.id} className={`absolute inset-0 z-10 flex items-center justify-center pointer-events-none mix-blend-overlay ${baseAnim}`}>
                      <h2 className={`text-white text-5xl sm:text-7xl font-bold uppercase tracking-wider drop-shadow-lg scale-in-center rotate-[-5deg] ${evt.strikeThrough ? 'line-through decoration-red-500 decoration-8' : ''}`}>
                        {evt.title}
                      </h2>
                      {evt.badge && (
                        <div className="absolute top-[30%] left-[20%] z-20 bg-red-600 text-white font-bold px-4 py-2 text-xl rounded-md rotate-[-20deg] shadow-2xl border-2 border-white animate-bounce">
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
                        <span className="text-red-500 font-bold text-xl tracking-widest">{evt.title}</span>
                      </div>
                    </div>
                  );
                case 'target_focus':
                  return (
                    <div key={evt.id} className={`absolute z-20 ${baseAnim}`} style={{ top: '36%', left: '32%' }}>
                       <div className="absolute flex items-center justify-center" style={{ transform: 'translate(-50%, -50%)' }}>
                          <div className="absolute border-2 border-dashed border-red-500 rounded-full animate-[spin_4s_linear_infinite]" style={{ width: '9vh', height: '9vh' }} />
                          <div className="absolute border border-[#78C4EC] rounded-full animate-ping opacity-50" style={{ width: '5vh', height: '5vh' }} />
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                       </div>
                       <div className="absolute top-[-2vh] left-[5.5vh] bg-black/85 text-white px-3 py-1.5 rounded-full font-bold text-[1.8vh] shadow-xl whitespace-nowrap border border-white/20">
                         🎯 {evt.title}｜{evt.subtitle}
                       </div>
                    </div>
                  );
                case 'progress_card':
                  return (
                    <div key={evt.id} className={`absolute z-20 bottom-24 left-0 right-0 mx-auto max-w-xs w-[90%] bg-white/98 backdrop-blur rounded-xl p-4 shadow-xl ${baseAnim}`}>
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-white bg-[#78C4EC] px-2 py-0.5 rounded">{evt.badge || 'FEATURE'}</span>
                          <span className="text-lg">{evt.icon}</span>
                       </div>
                       <h3 className="text-[#0F172A] font-extrabold text-sm mb-2">{evt.title}</h3>
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
                   <h2 className="text-[#0F172A] text-xl sm:text-2xl font-bold mb-6 leading-tight">
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
              <div className="absolute bottom-12 left-0 right-0 z-30 flex justify-center px-4">
                <div className="bg-slate-900/80 backdrop-blur-md rounded-full px-5 py-2.5 sm:px-6 sm:py-3 shadow-lg border border-white/10 text-center max-w-xs sm:max-w-md animate-in slide-in-from-bottom-2 fade-in duration-200">
                  <p className="text-white text-sm sm:text-base font-semibold tracking-wide">
                    {renderSubtitleText(activeEffects.subtitle.text, activeEffects.subtitle.highlight, activeEffects.subtitle.color)}
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

      {!isFullscreen && (
        <>
          {/* 控制列 */}
                <div className="flex flex-wrap items-center justify-center gap-3 bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-2xl shadow-sm border border-[#bbe3f8] mt-2 w-full max-w-sm sm:max-w-md">
                  <button
                    onClick={() => { unlockAudio(); setCardsVisible(!cardsVisible); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${cardsVisible ? "bg-[#78C4EC] text-white shadow-md hover:bg-[#6db3e0]" : "bg-gray-100 text-[#6d6d6d] hover:bg-gray-200"}`}
                  >
                    🃏 字卡：{cardsVisible ? "開" : "關"}
                  </button>

                  <button
                    onClick={() => { unlockAudio(); setSubtitlesVisible(!subtitlesVisible); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${subtitlesVisible ? "bg-[#78C4EC] text-white shadow-md hover:bg-[#6db3e0]" : "bg-gray-100 text-[#6d6d6d] hover:bg-gray-200"}`}
                  >
                    💬 字幕：{subtitlesVisible ? "開" : "關"}
                  </button>
                  <button
                    onClick={() => {
                      unlockAudio();
                      const v = videoRef.current;
                      if (v) {
                        if (v.paused) v.play().catch(() => { v.muted = true; v.play(); });
                        else v.pause();
                      }
                    }}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors bg-gray-100 text-[#0F172A] hover:bg-gray-200"
                  >
                    {isPlaying ? '⏸ 暫停影片' : '▶ 播放影片'}
                  </button>

                  <button
                    onClick={() => {
                      unlockAudio();
                      const v = videoRef.current;
                      if (v) {
                        v.muted = !v.muted;
                        setIsVideoMuted(v.muted);
                      }
                    }}
                    disabled={isExporting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                      !isVideoMuted
                        ? "bg-[#bbe3f8] text-[#0F172A] shadow-sm hover:bg-[#a9d9f2]"
                        : "bg-gray-100 text-[#6d6d6d] hover:bg-gray-200"
                    }`}
                  >
                    {!isVideoMuted ? "🔊 影片聲音：開" : "🔇 影片聲音：靜音"}
                  </button>

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
                    {effectEnabled ? "✨ AI 特效" : "🎬 原始影片"}
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
                      🎬 匯出有聲 MP4 影片 (v7.0)
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