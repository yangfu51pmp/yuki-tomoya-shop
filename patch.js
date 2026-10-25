const fs = require('fs');

let content = fs.readFileSync('src/components/AiVideoPlayer.tsx', 'utf8');

// 1. Add state variables and refs
content = content.replace(
  "const [exportProgress, setExportProgress] = useState(0);",
  `const [exportProgress, setExportProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [exportedFile, setExportedFile] = useState<File | null>(null);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);`
);

// 2. Replace exported_video.webm with iPhone .mp4 Export
// In handleLoadedMetadata, change AudioContext initialization
content = content.replace(
  "const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();",
  `if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;`
);

content = content.replace(
  "const source = audioCtx.createMediaElementSource(videoRef.current);",
  `if (!sourceNodeRef.current) {
        sourceNodeRef.current = audioCtx.createMediaElementSource(videoRef.current);
      }
      const source = sourceNodeRef.current;`
);

// In exportVideo, update options and rendering loop, remove downloaded_video.webm
content = content.replace(
  "const options = { mimeType: 'video/webm;codecs=vp8,opus' };",
  `let options: MediaRecorderOptions = { mimeType: 'video/mp4;codecs=avc1' };
        if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
            options = { mimeType: 'video/mp4' };
            if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
                options = { mimeType: 'video/webm;codecs=vp8,opus' };
            }
        }`
);

content = content.replace(
  "canvas.width = vw;\n        canvas.height = vh;",
  `canvas.width = Math.floor(vw / 2) * 2;\n        canvas.height = Math.floor(vh / 2) * 2;`
);

content = content.replace(
  "resolve(new Blob(chunks, { type: chunks[0] instanceof Blob ? chunks[0].type : 'video/webm' }));",
  `resolve(new Blob(chunks, { type: options.mimeType || 'video/mp4' }));`
);

content = content.replace(
  /const url = URL\.createObjectURL\(blob\);\s*const a = document\.createElement\("a"\);\s*a\.href = url;\s*a\.download = `exported_video\.webm`;\s*a\.click\(\);\s*URL\.revokeObjectURL\(url\);/,
  `const file = new File([blob], 'yuki-tomoya-video.mp4', { type: 'video/mp4' });
        const objUrl = URL.createObjectURL(file);
        setExportedFile(file);
        setExportedUrl(objUrl);`
);

// 3. UI Changes: Fullscreen Wrapper
// <div className="flex flex-col items-center gap-4 w-full"> -> <div className={`flex flex-col items-center gap-4 w-full ${isFullscreen ? 'fixed inset-0 z-[99999] bg-black/95 justify-center h-[100dvh]' : ''}`}>
content = content.replace(
  /<div className="flex flex-col items-center gap-4 w-full">/,
  `<div className={\`flex flex-col items-center gap-4 w-full \${isFullscreen ? 'fixed inset-0 z-[99999] bg-black/95 justify-center h-[100dvh]' : ''}\`}>`
);

// Add Top bar in Fullscreen mode
content = content.replace(
  /\{\/\* 播放器容器 \*\/\}/,
  `{/* 全螢幕頂部列 */}
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

      {/* 播放器容器 */}`
);

// Modify container class to support rotation
content = content.replace(
  /<div className=\{containerClass\} ref=\{containerRef\}>/,
  `<div className={\`\${containerClass} \${isFullscreen && isRotated ? 'rotate-90 w-[100dvh] h-[100vw] origin-center' : ''}\`} ref={containerRef}>`
);

// Add Fullscreen button to controls
content = content.replace(
  /\{cutEnabled \? "✂️ 氣口剪輯：開" : "✂️ 氣口剪輯：關"\}\n\s*<\/button>/,
  `{cutEnabled ? "✂️ 氣口剪輯：開" : "✂️ 氣口剪輯：關"}
        </button>

        <button
          onClick={() => setIsFullscreen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors bg-gray-100 text-[#6d6d6d] hover:bg-gray-200"
        >
          ⛶ 全螢幕放大
        </button>`
);

// Add Floating Fullscreen button inside video container
content = content.replace(
  /\{\/\* Exporting Overlay \*\/\}/,
  `{/* Floating Fullscreen button */}
        {!isFullscreen && (
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-3 right-3 z-40 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur transition shadow-lg flex items-center justify-center"
            title="全螢幕放大"
          >
            ⛶ 放大
          </button>
        )}

        {/* Exporting Overlay */}`
);

// Update Export button text and add Green Result Box
content = content.replace(
  /匯出影片\n\s*<\/button>\n\s*<\/div>/,
  `🎬 匯出 MP4 影片 (v2.0)
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
      )}`
);

fs.writeFileSync('src/components/AiVideoPlayer.tsx', content);
